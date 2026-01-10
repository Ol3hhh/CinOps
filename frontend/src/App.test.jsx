import { render } from '@testing-library/react';
import App from './App';
import { describe, it } from 'vitest'; 


describe('Główna aplikacja (App)', () => {
  it('renderuje się bez krytycznego błędu', () => {
    render(<App />);
    
    // screen.debug(); 
  });
});