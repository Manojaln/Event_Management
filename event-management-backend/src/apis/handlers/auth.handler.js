const bcrypt = require('bcrypt');
const { User, Role } = require('../../models');
const { HttpStatusCodeConstants } = require('../../constants/HttpStatusCodeConstants');
const { ResponseConstants } = require("../../constants/ResponseConstants");
const { generateJwtToken } = require("../../utils/jwtUtils");

const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const existingUser = await User.findOne({ where: { email } });
    // Throw error if email already exists
    if(existingUser) {
      const error = new Error(ResponseConstants.User.Error.ExistingUser);
      error.statusCode = HttpStatusCodeConstants.UnProcessable;
      throw error;
    }

    // Fetch the default "User" role
    const userRole = await Role.findOne({ where: { role_name: 'User' } });

    // Create user with the default role
    await User.create({ 
      username, 
      email, 
      password: hashedPassword,
      role_id: userRole.role_id,
      created_by: 'System'
    });

    res.statusCode = HttpStatusCodeConstants.Created;
    res.responseBody = { message: ResponseConstants.User.SuccessRegistration };
    next();
  } catch (error) {
    console.error(error.message);
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({
      where: { email },
      include: [{ model: Role, as: 'role' }]
    });
    // Throw error if user doesn't exist
    if(!user) {
      const error = new Error(ResponseConstants.User.Error.LoginFailed);
      error.statusCode = HttpStatusCodeConstants.Unauthorized;
      throw error;
    }

    // check for password match
    const isMatched = await bcrypt.compare(password, user.password);
    if (!isMatched) {
      const error = new Error(ResponseConstants.User.Error.LoginFailed);
      error.statusCode = HttpStatusCodeConstants.Unauthorized;
      throw error;
    }
    console.log(user.user_id)
    // Generate JWT Token
    const payload = { userId: user.userId, email: user.email, role: user.role.role_name };
    const token = generateJwtToken(payload);

    res.responseBody = { message: ResponseConstants.User.SuccessLogin, token: token, user: { userId: user.user_id, name: user.username, email: user.email, role: user.role.role_name } };
    next();
  } catch (error) {
    console.error(error.message);
    next(error);
  }
}

const getAll = async (req, res, next) => {
  console.log("getting all users");
  const users = await User.findAll();
  res.statusCode = HttpStatusCodeConstants.Ok;
  res.responseBody = { users };
  next();
}

module.exports = { register, login, getAll };
