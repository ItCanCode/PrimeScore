
// controllers/userController.js
let users = [{ id: 1, name: 'John Doe' }];

export const getAllUsers = (req, res) => {
  res.json(users);
};

export const createUser = (req, res) => {
  const newUser = {
    id: users.length + 1,
    name: req.body.name
  };
  users.push(newUser);
  res.status(201).json(newUser);
};
