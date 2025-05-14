const { Registration, User } = require('../../models');
const { HttpStatusCodeConstants } = require('../../constants/HttpStatusCodeConstants');
const { ResponseConstants } = require("../../constants/ResponseConstants");

const createRegistration = async (req, res, next) => {
    try {
        const {userId, eventId } = req.body
    
        const existingRegistration = await Registration.findOne({
          where: {
            event_id: eventId,
            user_id: userId,
          }
        });
    
        if (existingRegistration) {
            const error = new Error(ResponseConstants.Registration.Error.AlreadyRegistered);
            error.statusCode = HttpStatusCodeConstants.UnProcessable;
            throw error;
        }
    
        // Create new registration
        const registration = await Registration.create({
          event_id: eventId,
          user_id: userId,
          created_by: userId,
          updated_by: userId
        });
    
        res.statusCode = HttpStatusCodeConstants.Created;
        res.responseBody = { 
          message: ResponseConstants.Registration.SuccessRegistration,
          registration: registration
        };
        next();
      } catch (error) {
        console.error(error.message);
        next(error);
      }
  };

const deleteRegistration = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const email = req.decodedUser.email;
    const existingUser = await User.findOne({ where: { email } });
    const userId = existingUser.user_id;
    console.log(userId, eventId);
    const registration = await Registration.findOne({ where: { event_id: eventId, user_id:userId }});
    console.log(registration)
    if (!registration) {
      const error = new Error(ResponseConstants.Registration.Error.NotFound);
      error.statusCode = HttpStatusCodeConstants.NotFound;
      throw error;
    }
    
    registration.is_deleted = true;
    await registration.save();
    // await registration.destroy();

    res.statusCode = HttpStatusCodeConstants.Ok;
    res.responseBody = { message: ResponseConstants.Registration.SuccessDeletion };
    next();
  } catch (error) {
    console.error(error.message);
    next(error);
  }
};


module.exports = {createRegistration, deleteRegistration}