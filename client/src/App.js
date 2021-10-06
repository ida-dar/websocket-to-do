import React from 'react';
import { io } from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';

class App extends React.Component {
  state = {
    tasks: [],
    taskName: '',
  }

  componentDidMount(){
    this.socket = io((process.env.NODE_ENV === 'production') ? '' : 'localhost:8000', { transports: ["websocket"] });

    this.socket.on('updateData', (tasks) => this.updateTasks(tasks));
    this.socket.on('addTask', (task) => this.addTask(task));
    this.socket.on('editTask', (task) => this.editTask(task));
    this.socket.on('removeTask', (index) => this.removeTask(index));
  }

  updateTasks(newData) {
    this.setState({
      tasks: newData
    })
  }

  addTask(task) {
    const { tasks } = this.state;

    tasks.push(task);
    this.setState({
      tasks: tasks
    })
  }

  removeTask = (index, isLocal) => {
    const { tasks } = this.state;

    let taskIndex = tasks.findIndex(task => task === index);
    if(taskIndex && isLocal){
      tasks.splice(index, 1);
      this.setState({
        tasks: tasks
      })
      this.socket.emit('removeTask', {index});
    }
  }

  editTask = (task) => {
    const { tasks } = this.state;

    const newName = prompt('Edit task\'s name');
    let index = tasks.findIndex(el => el.name === task);
    tasks[index].name = newName;

    this.setState({
      tasks: tasks
    })
    this.socket.emit('editTask', tasks[index]);
  }

  submitForm = (e) => {
    const { taskName } = this.state;
    e.preventDefault();

    if(taskName === '') {
      alert('Please enter task\'s name');
    } else {
      let id = uuidv4();
      const taskData = {
        id: id,
        name: taskName
      }

      this.socket.emit('addTask', taskData);
      this.addTask(taskData);
      this.setState({
        taskName: ''
      })
    }
  }
  
  render() {

    const { removeTask, submitForm } = this;
    const { tasks, taskName } = this.state;

    return (
      <div className="App">
        <header>
          <h1>To-Do App</h1>
        </header>
  
        <section id="tasks-section" className="tasks-section">
          <h2>Tasks</h2>
  
          <ul id="tasks-list" className="tasks-section__list">
            {tasks && tasks.map((task, index) => (
              <li className="task" key={index}>
                <p>{task.name}</p>
                <button className='btn' onClick={() => this.editTask(task.name)}>Edit</button>
                <button className="btn btn-red" onClick={() => removeTask(index, true)}>Remove</button>
              </li>
            ))}
          </ul>

          <form id="add-task-form">
            <input 
              autoComplete="off" 
              id="task-content" 
              className="text-input" 
              type="text" 
              placeholder="Type task's description"
              value={taskName}
              onChange={e => (
                this.setState({
                  taskName: e.currentTarget.value
                })
              )} 
            />
            <button className="btn" type="submit" onClick={submitForm}>Add</button>
          </form>

        </section>
      </div>
    );
  }
}

export default App;
