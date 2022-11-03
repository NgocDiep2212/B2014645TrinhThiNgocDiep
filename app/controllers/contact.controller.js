const ContactService = require("../services/contact.service");
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");

exports.create = (req, res) => {
    res.send({message: "create hander"});
};

exports.findAll = (req, res) => {
    res.send({message: "findAll hander"});
};

exports.findOne = (req, res) => {
    res.send({message: "findOne hander"});
};

exports.update = (req, res) => {
    res.send({message: "update hander"});
};

exports.delete = (req, res) => {
    res.send({message: "delete hander"});
};

exports.deleteAll = (req, res) => {
    res.send({message: "deleteAll hander"});
};

exports.findAllFavorite = (req, res) => {
    res.send({message: "findAllFavorite hander"});
};



// Create and Save a new Contact
exports.create = async (req,res,next) => {
    if(!req.body?.name){
        return next(new ApiError(400, "Name can not be empty"));
    }

    try{
        const ContactService = new ContactService(MongoDB.client);
        const document = await ContactService.create(req.body);
        return res.send(document);
    } catch (error) {
        return next(
            new ApiError(500, "An error occurred while creating the contact")
        );
    }
};
