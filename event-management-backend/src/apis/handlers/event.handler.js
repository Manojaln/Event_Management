const { Event, User, Registration, EventCategory } = require('../../models');
const { HttpStatusCodeConstants } = require('../../constants/HttpStatusCodeConstants');
const { ResponseConstants } = require("../../constants/ResponseConstants");
const { formatEventResponse, getOrCreateCategory } = require('../../utils/eventUtils');
const { register } = require('./auth.handler');

const createEvent = async (req, res, next) => {
  try {
    const { title, description, type, date, time, location, imageUrl } = req.body;
    
    // Validate date and time formats
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;

    if (!dateRegex.test(date) || !timeRegex.test(time)) {
      const error = new Error('Invalid date/time format. Use YYYY-MM-DD for date and HH:MM for time');
      error.statusCode = HttpStatusCodeConstants.BadRequest;
      throw error;
    }

    // Combine date and time into event_date_time
    const event_date_time = new Date(`${date}T${time}:00`);

    // Get or create category
    const category_id = await getOrCreateCategory(type);
    
    const email = req.decodedUser.email;
    const existingUser = await User.findOne({ where: { email } });
    
    const event = await Event.create({
      event_name: title,
      description,
      event_date_time,
      location,
      thumbnail: imageUrl,
      category_id,
      created_by: existingUser.user_id,
      updated_by: existingUser.user_id
    });

    const formattedEvent = formatEventResponse(event);

    res.statusCode = HttpStatusCodeConstants.Created;
    res.responseBody = { 
      message: ResponseConstants.Event.SuccessCreation, 
      event: formattedEvent
    };
    next();
  } catch (error) {
    console.error(error.message);
    next(error);
  }
};

const getAllEvents = async (req, res, next) => {
  try {
    const events = await Event.findAll({
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['user_id', 'username'],
        },
        {
          model: Registration,
          as: "registrations",
          attributes: ['user_id'],
          required: false
        },
        {
          model: EventCategory,
          as: "category",
          attributes: ['category_type']
        },
      ],
    });


    const formattedEvents = events.map(formatEventResponse);

    res.statusCode = HttpStatusCodeConstants.Ok;
    res.responseBody = formattedEvents;
    next();
  } catch (error) {
    console.error(error.message);
    next(error);
  }
};

const getEventById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const event = await Event.findByPk(id, {
      include: [
        { model: EventCategory, as: 'category', attributes: ['category_type'] },
        { model: User, as: 'creator', attributes: ['user_id', 'username'] },
        { 
          model: Registration,
          as: 'registrations',
          required: false,
          include: [{ model: User, as: 'registrant', attributes: ['user_id']}]
        }
      ]
    });
    if (!event) {
      const error = new Error(ResponseConstants.Event.Error.NotFound);
      error.statusCode = HttpStatusCodeConstants.NotFound;
      throw error;
    }

    const formattedEvent = formatEventResponse(event);

    res.statusCode = HttpStatusCodeConstants.Ok;
    res.responseBody = formattedEvent;
    next();
  } catch (error) {
    console.error(error.message);
    next(error);
  }
};

const updateEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, type, date, time, location, imageUrl } = req.body;

    const event = await Event.findByPk(id);
    if (!event) {
      const error = new Error(ResponseConstants.Event.Error.NotFound);
      error.statusCode = HttpStatusCodeConstants.NotFound;
      throw error;
    }

    // Validate date and time formats
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;

    if (!dateRegex.test(date) || !timeRegex.test(time)) {
      const error = new Error('Invalid date/time format. Use YYYY-MM-DD for date and HH:MM for time');
      error.statusCode = HttpStatusCodeConstants.BadRequest;
      throw error;
    }

    // Combine date and time into event_date_time
    const event_date_time = new Date(`${date}T${time}:00`);

    // Get or create category
    const category_id = await getOrCreateCategory(type);

    // Update event fields
    event.event_name = title;
    event.description = description;
    event.event_date_time = event_date_time;
    event.location = location;
    event.thumbnail = imageUrl;
    event.category_id = category_id;
    event.updated_by = req.user?.id || 1;

    await event.save();
    const updatedEvent = await Event.findByPk(id, {
      include: [
        { model: EventCategory, as: 'category', attributes: ['category_type'] },
        { model: User, as: 'creator', attributes: ['user_id', 'username'] },
        { model: Registration, as: 'registrations', attributes: ['user_id'] }
      ]
    });

    const formattedEvent = formatEventResponse(updatedEvent);

    res.statusCode = HttpStatusCodeConstants.Ok;
    res.responseBody = { 
      message: ResponseConstants.Event.SuccessUpdate,
      event: formattedEvent
    };
    next();
  } catch (error) {
    console.error(error.message);
    next(error);
  }
};

const deleteEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log(id)
    const event = await Event.findByPk(id);
    if (!event) {
      const error = new Error(ResponseConstants.Event.Error.NotFound);
      error.statusCode = HttpStatusCodeConstants.NotFound;
      throw error;
    }

    // Delete associated registrations
    await Registration.destroy({ where: { event_id: id } });

    // Delete the event
    await event.destroy();

    res.statusCode = HttpStatusCodeConstants.Ok;
    res.responseBody = { message: ResponseConstants.Event.SuccessDeletion };
    next();
  } catch (error) {
    console.error(error.message);
    next(error);
  }
};

module.exports = { createEvent, getAllEvents, getEventById, updateEvent, deleteEvent };
