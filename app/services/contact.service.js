const { ObjectId } = require("mongodb");
const ApiError = require("../api-error");

class ContactService {
    constructor(client){
        this.Contact = client.db().collection("contacts");
    }
    //Dinh nghia cac phuong thuc truy xuat CSDL su dung mongodb API
    extractConactData(payload){
        const contact ={
            name: payload.name,
            email: payload.email,
            address: payload.address,
            phone: payload.phone,
            favorite: payload.favorite,
        };
        // Remove undefined fields
        Objects.keys(contact).forEach(
            (key) => contact[key] == undefined && delete contact[key]
        );
        return contact;
    }
    
    async creat(payload){
        const contact = this.extractConactData(payload);
        const result = await this.Contact.findOneAndUpdate(
            contact,
            { $set: { favorite: contact.favorite == true } },
            { returnDocument: "after", upsert: true }
        );
        return result.value;
    }

    async find(filter){
        const cursor = await this.Contact.find(filter);
        return await cursor.toArray();
    }

    async findByName(name){
        return await this.find({
            name: { $regex: new RegExp(name), $options: "i"},
        });
    }

    async findById(id){
        return await this.Contact.findOne({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        });
    }
    async update(id,payload){
        const filter ={
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        };
        const update = this.extractConactData(payload);
        const result = await this.Contact.findOneAndUpdate(
            filter,
            {$set: update},
            {returnDocument: "after"}
        );
        return result.value;
    }
    async delete(id){
        const result = await this.Contact.findOneAndDelete({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        });
        return result.value;
    }
    async findFavorite(){
        return await this.find({ favorite: true });
    }
    async deleteAll(){
        const result = await this.Contact.deleteMany({});
        return result.deletedCount;
        }
}

// Retrieve all contacts of a user from the database
exports.findAll = async (req, res, next) => {
    let document = [];

    try {
        const ContactService = new ContactService(MongoDB.client);
        const { name } = req.query;
        if (name){
            documents = await ContactService.findByName(name);
        }
        else{
            documents = await ContactService.find({});
        }
    } catch (error){
        return next(
            new ApiError(500, "An error occurred while retrieving contacts")
        );
    }
    return res.send(documents);
};

// Find a single contact with an id
exports.findOne = async (req, res, next) => {
    try{
        const ContactService = new ContactService(MongoDB.client);
        const document = await contactService.findById(req.params.id);
        if(!document){
            return next(new ApiError(404, "Contact not found"));
        }
        return res.send(document);
    } catch(error){
        return next(
            new ApiError(
                500,
                `Error retrieving contact with id=${Req.params.id}`
            )
        );
    }
};

exports.update = async (req,res,next) => {
    if(Object.keys(req.body).length = 0){
        return next(new ApiError(400, "Data to update can not be empty"));
    }

    try{
        const contactService = new ContactService(MongoDB.client);
        const document = await contactService.update(req.params.id,req.body);
        if(!document){
            return next(new ApiError(404, "Contact not found"));
        }
        return res.send({ message: "Contact was updated successfully "});
    } catch (error) {
        return next(
            new ApiError(500,`Error updating contact with id=${req.params.id}`)
        );
    }
};

// Delete a contact with the specified id in the request
exports.delete = async (req, res, next) => {
    try{
        const contactService = new ContactService(MongoDB.client);
        const document = await contactService.delete(req.params.id);
        if(!document){
            return next(new ApiError(404, "Contact not found"));
        }
        return res.send({message: "Contact was deleted successfully"});
    } catch(error){
        return next(
            new ApiError(
                500,
                `Could not delete contact with id=${req.params.id}`
            )
        );
    }
};

// Find all favorite contacts of a user
exports.findAllFavorite = async (_req, res, next) => {
    try {
        const contactService = new ContactService(MongoDB.client);
        const documents = await contactService.findFavorite();
        return res.send(documents);
    } catch (error){
        return next(
            new ApiError(
                500,
                "An error occurred while retrieving favorite contacts"
            )
        );
    }
};

// Delete all contacts of a user from the database
exports.deleteAll = async (_req, res, next) => {
    try {
        const contactService = new ContactService(MongoDB.client);
        const deletedCount = await contactService.deleteAll();
        return res.send({
            message: `${deletedCount} contacts were deleted successfully`,
        });
    } catch (error){
        return next(
            new ApiError(500, "An error occurred while removing all contacts")
        );
    }
};