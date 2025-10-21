import Joi from 'joi';

// Define the Joi schema based on the Mongoose userSchema
const userSchemaValidation = Joi.object({
    // Personal Information
    firstName: Joi.string()
        .trim() // Remove leading/trailing whitespace
        .min(2)
        .max(50)
        .required()
        .messages({
            'any.required': 'First name is required.',
            'string.empty': 'First name cannot be empty.',
            'string.min': 'First name must be at least 2 characters long.',
            'string.max': 'First name cannot exceed 50 characters.',
        }),

    lastName: Joi.string()
        .trim()
        .min(2)
        .max(50)
        .required()
        .messages({
            'any.required': 'Last name is required.',
            'string.empty': 'Last name cannot be empty.',
            'string.min': 'Last name must be at least 2 characters long.',
            'string.max': 'Last name cannot exceed 50 characters.',
        }),

    email: Joi.string()
        .trim()
        .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net', 'org', 'co'] } }) // Basic email format validation
        .required()
        .messages({
            'any.required': 'Email is required.',
            'string.empty': 'Email cannot be empty.',
            'string.email': 'Must be a valid email address.',
        }),

    password: Joi.string()
        .min(8) // Recommend minimum 8 characters for security
        .required()
        .messages({
            'any.required': 'Password is required.',
            'string.empty': 'Password cannot be empty.',
            'string.min': 'Password must be at least 8 characters long.',
        }),

    // Farming Details
    farmLocation: Joi.string()
        .trim()
        .required()
        .messages({
            'any.required': 'Farm location is required.',
            'string.empty': 'Farm location cannot be empty.',
        }),

    farmSize: Joi.string()
        .valid("small", "medium", "large", "commercial") // Must be one of the enum values
        .required()
        .messages({
            'any.required': 'Farm size is required.',
            'any.only': 'Farm size must be one of: small, medium, large, or commercial.',
        }),

    primaryCrops: Joi.string()
        .trim()
        .required()
        .messages({
            'any.required': 'Primary crops information is required.',
            'string.empty': 'Primary crops information cannot be empty.',
        }),

    // Terms and Privacy
    // These must be explicitly true/false and are required
    agreeTerms: Joi.boolean()
        .required()
        // You might want to add a validation that it must be true to proceed:
        // .valid(true) 
        .messages({
            'any.required': 'You must acknowledge the terms and conditions.',
            'boolean.base': 'Terms agreement must be a boolean value.',
            // 'any.only': 'You must agree to the terms and conditions.'
        }),
        
    agreePrivacy: Joi.boolean()
        .required()
        // You might want to add a validation that it must be true to proceed:
        // .valid(true) 
        .messages({
            'any.required': 'You must acknowledge the privacy policy.',
            'boolean.base': 'Privacy agreement must be a boolean value.',
            // 'any.only': 'You must agree to the privacy policy.'
        }),
});

export default userSchemaValidation;