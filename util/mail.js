import nodemailer from 'nodemailer';
import fs from 'fs';


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'nodemail2092@gmail.com',
        pass: 'tobiasrv'
    }
});

const mailOptions = {
    from: 'nodemail2092@gmail.com',
    to: '',
    subject: '10 Productos alcanzados!!!',
    html: `<h1>Usted a cargado 10 productos</h1>`
}

const sendMail = async () => {

    let mail = await fs.promises.readFile('./correo.dat', 'utf-8');
    mailOptions.to = mail;
    transporter.sendMail(mailOptions, (err, info) => {
        if(err){
            console.log(err);
            return err;
        }
        console.log(info);
    });
}

export default {
    sendMail
}
