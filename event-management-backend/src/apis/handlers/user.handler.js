const { Event, User, Registration, EventCategory } = require('../../models');
const { ResponseConstants } = require("../../constants/ResponseConstants");
const { HttpStatusCodeConstants } = require("../../constants/HttpStatusCodeConstants");
const { formatEventResponse } = require('../../utils/eventUtils');

const getUserById = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const user = await User.findOne({ where: { userId } });
    
        if(!user) {
            const error = new Error(ResponseConstants.User.Error.NotFound);
            error.statusCode = HttpStatusCodeConstants.NotFound;
            throw error;
        }
    
        res.statusCode = HttpStatusCodeConstants.Ok;
        res.responseBody = { userId: user.userId, name: user.username, email: user.email, role: user.role };
        next();
    } catch(error) {
        console.error(`Error while getting an user : ${error.message}`);
        next(error);
    }
}

const getAllEventRegisteredByUser = async (req, res, next) => {
    try {
        const { userId } = req.params;
    
        // Find all registrations by user
        const registrations = await Registration.findAll({
          where: {
            user_id: userId
          },
          include: [
            {
              model: Event,
              as: 'event',
              include: [
                {
                  model: User,
                  as: 'creator',
                  attributes: ['user_id', 'username']
                },
                {
                  model: Registration,
                  as: 'registrations',
                  attributes: ['user_id'],
                  required: false
                },
                {
                  model: EventCategory,
                  as: 'category',
                  attributes: ['category_type']
                }
              ]
            }
          ]
        });
    
        const response = registrations.map(r => formatEventResponse(r.event));
        
        res.statusCode = HttpStatusCodeConstants.Ok;
        res.responseBody = response;
        next();
      } catch (err) {
        console.error(err);
        next(err);
      }
}

module.exports = { getUserById, getAllEventRegisteredByUser };