import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import "./App.css";
import axios from "axios";
import { TodoistApi } from '@doist/todoist-api-typescript'

const api = new TodoistApi('0d2bd7a9e293bc03215a944b181617502eddadf6')
/* Нужно исправить добавление, начинает добавляться со 2 элемента
после перезагрузки */


// button-group
const buttons = [
  {
    type: "all",
    label: "All",
  },
  {
    type: "active",
    label: "Active",
  },
  {
    type: "done",
    label: "Done",
  },
];

const toDoItems = [
  {
    key: uuidv4(),
    label: "Have fun",
    done: false,
    important: false
  },
  {
    key: uuidv4(),
    label: "Spread Empathy",
    done: false,
    important: false
  },
  {
    key: uuidv4(),
    label: "Generate Value",
    done: false,
    important: false
  },
];

// helpful links:
// useState crash => https://blog.logrocket.com/a-guide-to-usestate-in-react-ecb9952e406c/
function App() {

  const [itemToAdd, setItemToAdd] = useState("");
  //arrow declaration => expensive computation ex: API calls
  const [items, setItems] = useState([]);

  useEffect(() => {
    api.getTasks()
    .then(tasks => setItems(tasks))
  }, [])
  console.log(items)
  
  const [searchField, setSearchField] = useState("")

  const [filterType, setFilterType] = useState("");

  const handleChangeItem = (event) => {
    setItemToAdd(event.target.value);
  };

  const handleAddItem = () => {
    api.addTask({ content: itemToAdd, projectId: 2203306141 })
    .then((task) => setItems([task, ...items]))
    .catch((error) => error)

    // const tempItems = [
    //   { label: itemToAdd, key: uuidv4() },
    //   ...items,
    // ]
    // setItems([...tempItems]);
    setItemToAdd("");
  };

  const handleRemoveItem = (key) => {
      let newData = items.filter((item) => item.key !== key)
      setItems(newData)
      localStorage.setItem("myitems", JSON.stringify(newData))
  }
      
  const handleItemDone = ({ id }) => {
    

    const tempItems = items.map((item) => {
      if (item.id === id) {
        if (!item.completed) {
          api.closeTask(id)
          .then((isSuccess) => console.log(isSuccess))
          .catch((error) => console.log(error))
        } else {
          api.reopenTask(id)
          .then((isSuccess) => console.log(isSuccess))
          .catch((error) => console.log(error))
          console.log(items)
        }
        return {...item, completed: !item.completed };
    } else 
      return item;
    })
    //second way updated
    setItems([...tempItems])

  };

  const handleItemImportant = ({ key }) => {

      
    const tempItems = items.map((item)=>{
      if (item.key === key) {
          return {...item, important: !item.important };
      } else 
        return item;
        
    })
      setItems([...tempItems])
      localStorage.setItem('myitems',JSON.stringify([...tempItems]))

  }

  const handleFilterItems = (type) => {
    setFilterType(type);
  };

  const filterSearch = () => {
      filteredItems.filter(item => item.content.toLowerCase().includes(searchField.toLowerCase()))
  }

  const handleChange = (event) => {
      setSearchField(event.target.value)
    }

  const searchItems = items.filter(item => item.content.toLowerCase().includes(searchField.toLowerCase()))
  
  const amountDone = items.filter((item) => item.completed).length;

  const amountLeft = items.length - amountDone;

  const filteredItems = 
      (!filterType || filterType === "all"
      ? searchItems
      : filterType === "active"
      ? searchItems.filter((item) => !item.completed)
      : searchItems.filter((item) => item.completed))


  return (
    <div className="todo-app">
      {/* App-header */}
      <div className="app-header d-flex">
        <h1>Todo List</h1>
        <h2>
          {amountLeft} more to do, {amountDone} done
        </h2>
      </div>

      <div className="top-panel d-flex">
        {/* Search-panel */}
        <input
          type="text"
          className="form-control search-input"
          placeholder="type to search"
          onChange={handleChange}
        />
        {/* Item-status-filter */}
        <div className="btn-group">
          {buttons.map((item) => (
            <button
              onClick={() => handleFilterItems(item.type)}
              key={item.type}
              type="button"
              className={`btn btn-${
                filterType !== item.type ? "outline-" : ""
              }info`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* List-group */}
      <ul className="list-group todo-list">
        {filteredItems.length > 0 &&
          filteredItems.map((item) => (
            <li key={item.id} className="list-group-item">
              <span className={`todo-list-item${item.completed ? " done" : ""}`}>
                <span
                  className="todo-list-item-label"
                  onClick={() => handleItemDone(item)}
                >
                  {item.content}
                </span>

                <button
                  type="button"
                  className="btn btn-outline-success btn-sm float-right"
                  onClick={() => handleItemImportant(item)}
                >
                  <i className="fa fa-exclamation" />
                </button>

                <button
                  type="button"
                  className="btn btn-outline-danger btn-sm float-right"
                  onClick={() => handleRemoveItem(item.key)}
                >
                  <i className="fa fa-trash-o" />
                </button>
              </span>
            </li>
          ))}
      </ul>

      {/* Add form */}
      <div className="item-add-form d-flex">
        <input
          value={itemToAdd}
          type="text"
          className="form-control"
          placeholder="What needs to be done"
          onChange={handleChangeItem}
        />
        <button className="btn btn-outline-secondary" onClick={handleAddItem}>
          Add item
        </button>
      </div>
    </div>
  );
}

export default App;
