import { messageFactory } from './index.js';

export const messages = {
    successfullyLoggedIn: 'Jste úspěšně přihlášen',
    userCreated: 'Uživatel byl úspěšně vytvořen',
    userSuccessfullyDeleted: 'Uživatel byl vymazán',
    userUpdated: 'Uživatel byl aktualizován',
    successfullySignedOut: 'Odhlášení proběhlo úspěšně',
    successfullyUpdated: 'Změna uložena',
    successfullyDeleted: 'Odstraněno',
    deviceCreated: 'Zařízení vytvořeno',
    deviceUpdated: 'Zařízení aktualizováno',
    deviceDeleted: 'Zařízení bylo odstraněno',
    notificationsUpdated: 'Notifikace nastaveny',
    commandSended: 'Požadavek odeslán',
    tokenCreated: 'Token byl vytvořen',
};
export type successMessageKey = keyof typeof messages;
export default messageFactory(messages);
