const express = require('express');
const path = require('path');
const socket = require('socket.io');

const app = express();

const tasks = [];

const server = app.listen(process.env.PORT || 8000, () => {
  console.log('Server is running');
});

const io = socket(server);

app.use((req, res) => {
  res.status(404).send({ message: 'Not found...' });
});

// app.use(express.static(path.join(__dirname, '/client')));

// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, '/client/build/index.html'));
// });

io.on('connection', (socket) => {
  console.log('New client! Its id – ' + socket.id);

  io.to(socket.id).emit('updateData', tasks);

  socket.on('addTask', ({id, name}) => {
    console.log(`Task added! Its name: ${name}`);

    socket.broadcast.emit('addTask', {id, name});
    tasks.push({id, name});
  });

  socket.on('editTask', ({id, name}) => {
    const index = tasks.findIndex(task => task.id === id);
    tasks[index].name = name;
    socket.broadcast.emit('editTask', {id, name});
    console.log(`Task edited! Its new name: ${name}`);
  })

  socket.on('removeTask', (index) => {
    console.log(`Task removed! Its index: ${index}`);

    tasks.splice(index, 1);
    socket.broadcast.emit('removeTask', index);
  });

  socket.on('disconnect', () => { 
    console.log('Oh, socket ' + socket.id + ' has left');
  });

  console.log('I\'ve added a listener on tasks and disconnect events \n');
});
