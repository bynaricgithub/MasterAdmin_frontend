import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import MainApp from './MainApp';
import { Provider } from 'react-redux';
import Store from './Store';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
	<Provider store={Store}>
		<MainApp />
	</Provider>
);
