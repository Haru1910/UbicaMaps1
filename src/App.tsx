import { useState } from 'react';
import { LoginScreen } from './components/LoginScreen';
import { AdminMap } from './components/AdminMap';
import { MotorizadoView } from './components/MotorizadoView';

type AppState =
  | { screen: 'login' }
  | { screen: 'admin'; id: string; nombre: string }
  | { screen: 'motorizado'; id: string; nombre: string };

function App() {
  const [state, setState] = useState<AppState>({ screen: 'login' });

  const handleLogin = (tipo: 'admin' | 'motorizado', id: string, nombre: string) => {
    if (tipo === 'admin') {
      setState({ screen: 'admin', id, nombre });
    } else {
      setState({ screen: 'motorizado', id, nombre });
    }
  };

  const handleLogout = () => {
    setState({ screen: 'login' });
  };

  switch (state.screen) {
    case 'login':
      return <LoginScreen onLogin={handleLogin} />;
    case 'admin':
      return <AdminMap adminName={state.nombre} onLogout={handleLogout} />;
    case 'motorizado':
      return <MotorizadoView motoId={state.id} motoName={state.nombre} onLogout={handleLogout} />;
  }
}

export default App;
