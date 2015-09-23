"use strict";

const http = require('http');
const jsdom = require("jsdom").jsdom;
const jQuery = require('jquery');
const ejs = require('ejs');
const fs = require('fs');
const path = require('path');
const mailer = require('nodemailer');
const iconv  = require('iconv-lite');

function getScheduleContent(options, cb) {
    return http.get({
        host: options.host,
        path: options.path,
        auth: options.auth.user + ':' + options.auth.pass,
        encoding: 'binary'
    }, function (response) {
        let body = '';

        response.on('data', function (d) {
            body += iconv.decode(d, 'ISO-8859-1').toString();
        });

        response.on('end', function () {
            cb(body);
        });
    });
}

function getSubstitutionsForTeacherId(content, teacherId) {
    const doc = jsdom(content).defaultView;
    const $ = jQuery(doc);
    const $scheduleRows = $('.mon_list tr');

    let substitutions = [];
    $scheduleRows.each(function () {
        const $fields = $(this).children();

        const substitution = $fields.eq(0).text();
        if (substitution !== teacherId) {
            return;
        }

        const substitutionData = {
            hour: $fields.eq(1).text(),
            course: $fields.eq(2).text(),
            room: $fields.eq(3).text(),
            subject: $fields.eq(4).text(),
            substituted: $fields.eq(5).text(),
            text:  $fields.eq(8).text()
        };

        substitutions.push(substitutionData);
    });

    return substitutions;
}

function sendSubstitutions(substitutions, teacher, transport, sender, template) {
    const mail = ejs.compile(template)({name: teacher.name, substitutions: substitutions});
    console.log('Sending mail to ' + teacher.mail);
    console.log(mail);
    transport.sendMail({
        from: sender.name + ' <' + sender.mail + '>',
        to: teacher.mail,
        subject: 'Deine Vertretungen für morgen',
        text: mail
    }, function (error) {
        if (error) {
            console.log('Error sending message to ' + teacher.mail + ': ' + error);
        } else {
            console.log('Successfully sent message to ' + teacher.mail);
        }
    });
}

function main() {
    const conf = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'conf.json'), 'utf8'));
    const transport = mailer.createTransport(conf.mail.smtp);
    const template = fs.readFileSync(path.resolve(__dirname, 'mail.ejs'), 'utf-8');

    getScheduleContent(conf.website, function (content) {
        conf.teachers.forEach(function (teacher) {
            const substitutions = getSubstitutionsForTeacherId(content, teacher.id);
            sendSubstitutions(substitutions, teacher, transport, conf.mail.sender, template);
        });
    });
}

if (require.main === module) {
    main();
}






