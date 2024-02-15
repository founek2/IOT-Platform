import { messageFactory } from '.';

const messages = {
    userManagement: 'Správe uživatelů',
    dashboard: 'Přehled',
    registration: 'Registrovat',
    deviceControl: 'Správa Zařízení',
    devices: 'Zařízení',
    about: 'Informace',
    visualProgramming: 'Automatizace',
};

export type UiMessageKey = keyof typeof messages;
export default messageFactory(messages);
