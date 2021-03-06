import { createContext, useEffect, useState } from 'react';
import axios from 'axios';

const TodoContext = createContext();

export const TodoProvider = ({ children }) => {

  const [todos, setTodos] = useState([]);
  const [checked, setChecked] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);
  const [errMessage, setErrMessage] = useState('');
  const [id, setId] = useState('');
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [filterTodos, setfilterTodos] = useState([]);

  useEffect(() => {
    getData();
    // eslint-disable-next-line
    totalTodo();
    // eslint-disable-next-line
  }, []);

  const getData = () => {
    setLoading(true);

    axios
      .get('http://localhost:3000/todos')
      .then(reponse => {
        setTodos(reponse.data);
        setLoading(false);
      })
      .catch(error => {
        setError(true);
        setErrMessage(error.message);
      });
  };

  const totalTodo = () => {
    let counter = 0;
    setTotal(todos.length);
    todos.forEach(todo => {
      if (!todo.completed) {
        return counter--;
      }
      if (todo.completed) {
        return counter++;
      }
    });

    setTotal((todos.length - counter) / 2);
  };

  const inputTodo = e => {
    setInput(e.target.value);
  };

  const submitTodo = e => {
    if (input !== '') {
      if (id === '') {
        setLoading(true);

        axios
          .post('http://localhost:3000/todos', {
            todo: input,
            completed: false,
          })
          .then(reponse => {
            setTodos([...todos, reponse.data]);

            setLoading(false);
          })
          .catch(error => {
            setError(true);
            setErrMessage(error.message);
          });
      } else {
        setLoading(true);

        axios
          .put(`http://localhost:3000/todos/${id}/`, {
            todo: input,
            completed: false,
          })
          .then(reponse => {
            // eslint-disable-next-line
            setTodos(
              todos.map(todo => (todo.id == id ? { id, todo: input } : todo))
            );
            setId('');
            if (
              document.querySelector('form').lastElementChild ===
              document.querySelector('.form-cancel')
            ) {
              document.querySelector('form').lastElementChild.remove();
            }
            setLoading(false);
          })
          .catch(error => {
            setError(true);
            setErrMessage(error.message);
          });
      }
    }
    setInput('');
    e.preventDefault();
  };

  const updateTodo = async e => {
    let id = e.target.parentElement.parentElement.dataset.id;
    let p = e.target.parentElement.previousElementSibling.textContent;
    let cross = e.target.nextElementSibling;
    setInput(p);
    setId(id);

    let form = document.querySelector('form');
    if (form.childElementCount > 2) {
      form.lastElementChild.remove();
    }
    let formCross = cross.cloneNode(true);
    formCross.classList.add('form-cancel');
    form.appendChild(formCross);
    formCross.addEventListener('click', () => {
      setId('');
      setInput('');
      form.lastElementChild.remove();
    });
  };

  const deleteTodo = e => {
    let id = e.target.parentElement.parentElement.dataset.id;
    setLoading(true);

    axios
      .delete(`http://localhost:3000/todos/${id}/`)
      .then(response => {
        getData();
        setId('');
        setInput('');
        setLoading(false);

        if (
          document.querySelector('form').lastElementChild ===
          document.querySelector('.form-cancel')
        ) {
          document.querySelector('form').lastElementChild.remove();
        }
      })
      .catch(error => {
        setError(true);
        setErrMessage(error.message);
      });
  };

  const modeToggle = () => {
    setDarkMode(!darkMode);
    if (darkMode === false) {
      if (document.documentElement.classList.contains('dark')) {
        document.documentElement.classList.remove('dark');
      }
    } else {
      document.documentElement.classList.add('dark');
    }
  };

  const checkBox = e => {
    setChecked(!checked);
    let li = e.target.parentElement.parentElement.parentElement;
    let p = e.target.parentElement.parentElement.nextElementSibling;

    li.dataset.completed = checked;
    if (checked) {
      e.target.classList.add('bg-transparent', 'dark:bg-transparent');
      e.target.parentElement.classList.add(
        'bg-gradient-to-r',
        'from-gradient-blue',
        'to-gradient-purple'
      );
      p.classList.add('line-through', 'text-light-grayish-blue');
    }
    if (!checked) {
      e.target.classList.remove('bg-transparent', 'dark:bg-transparent');
      e.target.parentElement.classList.remove(
        'bg-gradient-to-r',
        'from-gradient-blue',
        'to-gradient-purple'
      );
      p.classList.remove('line-through', 'text-light-grayish-blue');
    }

    let text =
      e.target.parentElement.parentElement.nextElementSibling.textContent;
    let id = e.target.parentElement.parentElement.parentElement.dataset.id;

    setLoading(true);

    axios
      .put(`http://localhost:3000/todos/${id}/`, {
        todo: text,
        completed: checked,
      })
      .then(response => {
        getData();
        setLoading(false);
      })
      .catch(error => {
        setError(true);
        setErrMessage(error.message);
      });
  };

  const clearCompleted = () => {
    todos.forEach(todo => {
      if (todo.completed) {
        let id = todo.id;
        setLoading(true);

        axios
          .delete(`http://localhost:3000/todos/${id}/`)
          .then(reponse => {
            getData();
            setLoading(false);
            setId('');
            setInput('');
            if (
              document.querySelector('form').lastElementChild ===
              document.querySelector('.form-cancel')
            ) {
              document.querySelector('form').lastElementChild.remove();
            }
          })
          .catch(error => {
            setError(true);
            setErrMessage(error.message);
          });
      }
    });
  };

  const displayCompleted = () => {
    setfilterTodos(todos.filter(todo => todo.completed === true));
  };

  const displayActive = () => {
    setfilterTodos(todos.filter(todo => todo.completed !== true));
  };

  const displayAll = () => {
    setfilterTodos(todos);
  };

  const dragItem = () => {
    let dragStartIndex;
    let dragEndIndex;
    let lis = document.querySelectorAll('.todo-item');

    lis.forEach((li, index) => {
      li.addEventListener('dragstart', e => {
        dragStartIndex = index;
      });
      li.addEventListener('dragenter', e => {
        e.target.parentElement.classList.add(
          'bg-very-light-grayish-blue',
          'dark:bg-very-dark-grayish-blue-dark'
        );
      });
      li.addEventListener('dragleave', e => {
        e.target.parentElement.classList.remove(
          'bg-very-light-grayish-blue',
          'dark:bg-very-dark-grayish-blue-dark'
        );
      });
      li.addEventListener('dragover', e => {
        e.preventDefault();
      });
      li.addEventListener('drop', e => {
        dragEndIndex = index;

        const itemOne = lis[dragStartIndex];
        const itemTwo = lis[dragEndIndex];
        itemTwo.insertAdjacentElement('afterend', itemOne);
        e.target.parentElement.classList.remove(
          'bg-very-light-grayish-blue',
          'dark:bg-very-dark-grayish-blue-dark'
        );
      });
    });
  };

  return (
    <TodoContext.Provider
      value={{
        todos,
        checked,
        darkMode,
        input,
        error,
        errMessage,
        id,
        loading,
        total,
        filterTodos,
        setfilterTodos,
        getData,
        totalTodo,
        inputTodo,
        submitTodo,
        updateTodo,
        deleteTodo,
        modeToggle,
        checkBox,
        clearCompleted,
        displayCompleted,
        displayActive,
        displayAll,
        dragItem,
      }}
    >
      {children}
    </TodoContext.Provider>
  );
};

export default TodoContext;
