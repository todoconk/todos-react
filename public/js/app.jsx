class TodoFooter extends React.Component {
    constructor(props) {
        super(props);

        this.handleClick = this.handleClick.bind(this);

        this.state = {
            todos: this.props.todos,
            completed: [],
            left: []
        }
    }

    // Sync initial state
    componentWillMount() {
        this.handleSummary(this.state);
    }

    // Sync any change
    componentWillReceiveProps(nextProps) {
        this.handleSummary(nextProps);
    }

    // Clear completed
    handleClick() {
        this.state.completed.forEach((el) => {
            TodoApp.removeItem(el.id);
        });
    }

    // Sync method
    handleSummary(props) {
        let completed = [], left = [];
        props.todos.forEach((el) => {
            if (el.done) {
                completed.push(el);
            } else {
                left.push(el);
            }
        });

        this.setState({completed: completed, left: left});
    }

    render() {
        let showClear = null;

        if (this.state.completed.length > 0) {
            showClear = <a id="clear-completed"
                           onClick={this.handleClick}>Clear {this.state.completed.length} completed item</a>;
        }

        return (
            <footer>
                {showClear}
                <div className="todo-count"><b>{this.state.left.length}</b> items left</div>
            </footer>
        )
    }
}

class TodoToggleAll extends React.Component {
    constructor(props) {
        super(props);

        this.handleToggle = this.handleToggle.bind(this);

        this.state = {
            todos: this.props.todos,
            checked: false
        };
    }

    // Sync initial state
    componentWillMount() {
        this.handleDone(this.state);
    }

    // Sync any change
    componentWillReceiveProps(nextProps) {
        this.handleDone(nextProps);
    }

    // Sync method
    handleDone(props) {
        let completed = props.todos.filter((el) => {
            return el.done;
        });

        this.setState({checked: completed.length == props.todos.length, todos: props.todos});
    }

    // Toggle done all items
    handleToggle() {
        console.log(!this.state.checked);
        this.setState({checked: !this.state.checked});
        this.state.todos.forEach((el) => {
            TodoApp.doneItem(el.id, `${!this.state.checked}`);
        });
    }

    render() {
        return (
            <div>
                <input id="toggle-all" type="checkbox" onChange={this.handleToggle} checked={this.state.checked}/>
                <label htmlFor="toggle-all">Mark all as complete</label>
            </div>
        )
    }
}

class TodoNewForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {value: ''};

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(event) {
        this.setState({value: event.target.value});
    }

    handleSubmit(event) {
        event.preventDefault();

        axios.post('/todos', {
            title: this.state.value,
            done: false
        }).then(response => {
            this.setState({value: ''});

            TodoApp.addItem(response.data);
        }).catch(error => alert(error));
    }

    render() {
        return (
            <form onSubmit={this.handleSubmit}>
                <input id="new-todo" type="text" placeholder="What needs to be done?"
                       value={this.state.value}
                       onChange={this.handleChange}/>
            </form>
        )
    }
}

class TodoRow extends React.Component {
    constructor(props) {
        super(props);

        this.handleDoubleClick = this.handleDoubleClick.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleToggle = this.handleToggle.bind(this);

        this.state = {value: this.props.title, checked: this.props.done, edit: false};
    }

    handleKeyPress(event) {
        if (+event.keyCode === 13) {
            axios.put('/todos/' + this.props.id, {
                title: this.state.value
            }).then(response => {
                this.handleDoubleClick();
            }).catch(error => {
                alert(error);
            });
        }
    }

    // Edit Title
    handleChange(event) {
        this.setState({value: event.target.value});
    }

    // Toggle View-Edit
    handleDoubleClick() {
        this.setState({edit: !this.state.edit});
    }

    // Delete
    handleClick() {
        TodoApp.removeItem(this.props.id);
    }

    // Sync any change
    componentWillReceiveProps(nextProps) {
        this.setState({value: nextProps.title, checked: nextProps.done, edit: false});
    }

    // Toggle Done
    handleToggle() {
        TodoApp.doneItem(this.props.id, `${!this.state.checked}`);
    }

    render() {
        let classes = `${this.state.checked ? 'done' : ''} ${this.state.edit ? 'editing' : ''}`;
        return (
            <li className={classes}>
                <div className="view">
                    <input className="toggle" type="checkbox" checked={this.state.checked}
                           onChange={this.handleToggle}/>
                    <label onDoubleClick={this.handleDoubleClick}>{this.state.value}</label>
                    <a className="destroy" onClick={this.handleClick}></a>
                </div>
                <input className="edit" type="text" value={this.state.value}
                       onChange={this.handleChange} onKeyUp={this.handleKeyPress}/>
            </li>
        )
    }
}

class TodoApp extends React.Component {
    constructor(props) {
        super(props);

        TodoApp.addItem = TodoApp.addItem.bind(this);
        TodoApp.doneItem = TodoApp.doneItem.bind(this);
        TodoApp.removeItem = TodoApp.removeItem.bind(this);

        this.handleToggle = this.handleToggle.bind(this);

        this.state = {
            todos: []
        };
    }

    handleToggle() {

    }

    static addItem(item) {
        this.state.todos.unshift(item);
        this.setState({todos: this.state.todos});
    }

    static removeItem(id) {
        axios.delete('/todos/' + id)
            .then(response => {
                this.setState({
                    todos: this.state.todos.filter(function(todo) {
                        return todo.id !== id
                    })
                });
            })
            .catch(error => {
                alert(error);
            });
    }

    static doneItem(id, checked) {
        axios.put('/todos/' + id, {
            done: checked
        }).then(response => {
            this.setState({
                todos: this.state.todos.map((todo) => {
                    return todo.id == response.data.id ? response.data : todo;
                })
            });
        }).catch(error => {
            alert(error);
        });

    }

    componentWillMount() {
        axios.get(`/todos`)
            .then(response => this.setState({todos: response.data}))
    }

    render() {
        let markAll = null, showFooter = null;
        if (this.state.todos.length > 0) {
            markAll = <TodoToggleAll todos={this.state.todos}/>;
            showFooter = <TodoFooter todos={this.state.todos}/>;
        }

        return (
            <div className="wrapper">
                <header>
                    <h1>Todos</h1>
                    <TodoNewForm/>
                </header>
                <section classID="main">
                    {markAll}
                    <ul id="todo-list">
                        {
                            this.state.todos.map((task) => {
                                return <TodoRow key={task.id}
                                                id={task.id}
                                                title={task.title}
                                                done={task.done}/>
                            })
                        }
                    </ul>
                </section>
                {showFooter}
            </div>
        )
    }
}

ReactDOM.render(<TodoApp/>, document.getElementById('todoapp'));
