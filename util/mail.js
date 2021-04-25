import nodemailer from 'nodemailer';
import fs from 'fs';


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'nodemail2092@gmail.com',
        pass: 'tobiasrv'
    }
});

const sendMail = async (data) => {

    let email = await fs.promises.readFile('./correo.dat', 'utf-8');
    const mailOptions = {
        from: 'nodemail2092@gmail.com',
        to: email,
        subject: '10 Productos alcanzados!!!',
        html: `
        <div>
            <h2 style="text-align:center;">Listado de Productos:</h2>
            <ul>${(data.length == 0)
                ?'<h2 style="text-align:center;">Empty DB</h2>'
                :data.map(product => (`
                <li style="margin: 0;">
                    <p style="margin: 0;">
                        Nombre: <strong>${product.name}</strong>,
                        Precio: <strong>$${product.price}</strong>,
                        Descripción: <strong>${product.description}</strong>
                    </p>
                </li>`))}
            </ul>
        </div>`
    }
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
