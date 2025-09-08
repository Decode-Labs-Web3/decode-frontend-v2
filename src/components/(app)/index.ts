import Topbar from './Topbar';
import Sidebar from './Sidebar';
import Overview from './Overview';
import Security from './Security';
import Wallets from './Wallets';
import Connections from './Connections';
import News from './News';
import Notifications from './Notifications';
import Devices from './Devices';
import Personal from './Personal';

const App = {
  Topbar,
  Sidebar,
  Overview,
  Security,
  Wallets,
  Connections,
  News,
  Notifications,
  Devices,
  Personal,
} as const;

export default App;