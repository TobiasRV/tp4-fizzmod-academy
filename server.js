import express from 'express';
import handlebars from 'express-handlebars';
import _handlebars from 'handlebars';
import mongoose from 'mongoose';
import model from './models/product.js';
import { allowInsecurePrototypeAccess } from '@handlebars/allow-prototype-access';
import multer from 'multer';
import mail from './util/mail.js';
import fs from 'fs';

const app = express();

const PORT = process.env.PORT || 8080;

mongoose.connect('mongodb+srv://tobias:root@cluster0.dyzxp.mongodb.net/productos?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}, err => {
    if(err) throw Error(`Unable to connect to database: ${err}`);
    console.log('Conection success');
    const server = app.listen(PORT, () => {

        try{
                if (!fs.existsSync('./uploads')){
                    fs.mkdirSync('./uploads');
                }
            if(!fs.existsSync('./correo.dat')){
                fs.writeFileSync('./correo.dat', 'rodriguezviautobias@gmail.com');
            }
        }
        catch(err){
            console.log(err);
        }
        console.log(`Listening to port ${server.address().port}`);
    });
    server.on('error', error => console.log(`Server error: ${error}`));

});

// mongoose.connect('mongodb://localhost/productos', {
//     useNewUrlParser: true,
//     useUnifiedTopology: true
// }, err => {
//     if(err) throw Error(`Unable to connect to database: ${err}`);
//     console.log('Conection success');
//     const server = app.listen(PORT, () => {

//         try{


//             if(!fs.existsSync('./correo.dat')){
//                 fs.writeFileSync('./correo.dat', 'rodriguezviautobias@gmail.com');
//             }
//         }
//         catch(err){
//             console.log(err);
//         }
//         console.log(`Listening to port ${server.address().port}`);
//     });
//     server.on('error', error => console.log(`Server error: ${error}`));

// });

const storage = multer.diskStorage({
    destination: function (req,file,cb) {
        cb(null, 'uploads');
    },
    filename: function(req,file,cb) {
        cb(null, file.originalname.split('.')[0] + '-' + Date.now() + '.jpg');
    }
});
const upload = multer({storage: storage});


app.use(express.urlencoded({
    extended: true
 }));
 app.use(express.json());

app.use((req,res,next) => {
    next();
});

app.engine('hbs', handlebars({extname:'.hbs', defaultLayout: 'index.hbs', handlebars: allowInsecurePrototypeAccess(_handlebars)}, ) );
app.set('views', './views');
app.set('view engine', 'hbs');

app.get('/' , (req , res)=>{
    res.render('form');
});

let count = 0;
app.post('/data' , upload.single('photo'),(req , res)=>{
    let product = req.body;
    product.photo = req.file.filename;
    let newProduct = new model.product(product);
    newProduct.save(err => {
        if(err) throw new Error(`Query error: ${err}`);
        console.log('Product load');
        count++;
        if(count == 10){
            count = 0;
            mail.sendMail();
        }
        res.redirect('/');
    });


});

app.get('/list' , (req , res)=>{
    model.product.find({}, (err, data) =>{
        data.forEach( product => {
            product.photo = `${req.protocol}://${req.get('host')}/get-img?name=${product.photo}`;
        });
        console.log(data);
        if(err) throw new Error(`Query error: ${err}`);
        res.render('table',{data});
    });
});

app.post('/set-correo' , async (req , res) => {
    try{
        await fs.promises.writeFile('./correo.dat', req.body.mail);
        res.redirect('/');
    }catch(error){
        console.log(`Error writing file:  ${error}`);
    }
});

app.get('/set-correo' , (req , res)=>{
    res.render('mail-form');
});


app.get('/get-img' , (req , res)=>{
    let data = req.query;
    res.sendFile(`${process.cwd()}/uploads/${data.name}`);
});
