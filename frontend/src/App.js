import './App.css';
import { Route } from 'react-router-dom';
import Home from './Pages/home';
import chatpage from './Pages/Chatpage';
function App() {
  return (
    <div className="App">
      <Route path='/' component={Home} exact />
      <Route path='/chats' component={chatpage} />
    </div>
  );
}

export default App;
