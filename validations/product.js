import Joi from '@hapi/joi';

const validateProduct = (product) => {
    const productSchema = Joi.object({
        name: Joi.string().alphanum().required(),
        price: Joi.number().positive().allow(0).required(),
        description: Joi.string().alphanum().required(),
         photo: Joi.required()
    });

    const {error } = productSchema.validate(product);
    if(error){
        return {
            result: false,
            error: error
        };
    }else{
        return {
            result: true
        }
    }
}

const validateEmail = (email) => {
    const emailSchema = Joi.object({
        email: Joi.string().email().required()
    });

    const {error } = productSchema.validateEmail(email);
    if(error){
        return {
            result: false,
            error: error
        };
    }else{
        return {
            result: true
        }
    }
}

export default{
    validateProduct,
    validateEmail
}
