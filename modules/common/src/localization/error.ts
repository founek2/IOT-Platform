import { messageFactory } from './index.js';

export const messages = {
    userNameAlreadyExist: 'Uživ. jméno je obsazeno',
    emailAlreadyExist: 'Emailová adresa je obsazena',
    passwordMissmatch: 'Nesprávné heslo',
    unknownUser: 'Neznámý uživatel',
    userNotExist: 'Uživatel neexistuje',
    invalidToken: 'Platnost přihlášení vypršela',
    tokenNotProvided: 'Token nebyl v hlavičce',
    lowPermissionsForThatGroups: 'Nízké oprávnění pro nastavení těchto skupin',
    unexpectedError: 'Nastala neočekávaná chyba',
    unavailableBackend: 'Server je nedostupný',
    noneUserFoundForDelete: 'Nenalezen uživatel ke smazání',
    cityAlreadyExist: 'Toto město již existuje',
    ValidationError: 'Odeslaná data nebyla validní',
    payloadTooLarge: 'Soubor je příliš velký',
    notAllowedExtension: 'Nepodporovaný formát souboru',
    missingFormData: 'V dotazu chybí formulářová data',
    invalidPermissions: 'Nedostatečná oprávnění',
    validationFailed: 'Nevalidní formulář',
    invalidParam: 'Špatný request',
    notImplemented: 'Funkce není implementována',
    entityNotFound: 'Požadovaný zdroj nebyl nalezen',
    deviceNotExits: 'Zařízení neexistuje',
    topicAlreadyUsed: 'Zadaný topic je již obsazen',
    InvalidDeviceId: 'Neznámé zařízení',
    notificationsDisabled: 'Toto zařízení má vypnuté notifikace',
    deviceNotReady: 'Zařízení není připravené',
    deviceIdTaken: 'Zařízení s daným ID již existuje',
    offlineMode: "Není k dispozici připojení k internetu",
    unstableConnection: "Data nemusí být aktuální",
};
export type ErrorMessageKey = keyof typeof messages;
export const ErrorMessages = messageFactory(messages);
export default ErrorMessages;
