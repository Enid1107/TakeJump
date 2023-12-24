import { Game } from './game';
declare global {
    interface Window {
        gameSubject: Game;
    }
}

export {};