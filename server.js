import express from 'express';
import handlebars from 'express-handlebars';
import _handlebars from 'handlebars';
import mongoose from 'mongoose';
import model from './models/product.js';
import { allowInsecurePrototypeAccess } from '@handlebars/allow-prototype-access';
import multer from 'multer';
import mail from './util/mail.js';
import fs from 'fs';
import validation from './validations/product.js';



const app = express();

const PORT = process.env.PORT || 8080;

// Atlas MongoDB
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

// //Local mongodb
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

//Multer Config
const storage = multer.diskStorage({
    destination: function (req,file,cb) {
        cb(null, 'uploads');
    },
    filename: function(req,file,cb) {
        cb(null, file.originalname.split('.')[0] + '-' + Date.now() + '.jpg');
    },
    onError: function(err,next){
        console.log(`Multer error ${err}`);
        next(err);
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

//Store form data in mongo and send mail when needed
app.post('/data' , upload.single('photo'),(req , res)=>{
    let product = req.body;
    if(req.file.filename != null){
        product.photo = req.file.filename;
        let val = validation.validateProduct(product);
        if(val.result){
            let newProduct = new model.product(product);
            console.log(newProduct);
            newProduct.save(err => {
                if(err) throw new Error(`Query error: ${err}`);
                console.log('Product load');
                let products = model.product.find({}, (err) => {
                    if(err) throw new Error(`Reading error: ${err}`);
                }).lean();
                if(products.length%10 === 0){
                    mail.sendMail(products);
                }
                res.redirect('/');
            });
        }else{
            fs.unlinkSync(req.file.path, (err) => {
                if (err) {
                    throw err;
                }
            });
            res.send(`Error saving product: ${val.error}`);
        }
    }else{
        res.send(`Photo is required`);
    }
});

//List all products
app.get('/listar' , (req , res)=>{
    model.product.find({}, (err, data) =>{
        data.forEach( product => {
            product.photo = `${req.protocol}://${req.get('host')}/get-img?name=${product.photo}`;
        });
        if(err) throw new Error(`Query error: ${err}`);
        res.render('table',{data});
    });
});

//Set email in config file
app.post('/set-correo' , async (req , res) => {

    let email = req.body.mail

    let val = validation.validateEmail({email});
    if(val.result){
        try{
            await fs.promises.writeFile('./correo.dat', email);
            res.redirect('/');
        }catch(error){
            console.log(`Error writing file:  ${error}`);
        }
    }else{
        res.send(`Error saving email: ${val.error}`);
    }
});
//Set email view
app.get('/set-correo' , (req , res)=>{
    res.render('mail-form');
});

//Get product img
app.get('/get-img' , (req , res)=>{
    let data = req.query;
    res.sendFile(`${process.cwd()}/uploads/${data.name}`);
});
