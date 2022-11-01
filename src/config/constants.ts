export const PASSWORD_SALT_LENGTH = 64;

export const NON_LOGGED_KEYS = [
	'password',
	'refresh'
];

export const ENDPOINTS = {
	register: '/register',
	login: '/login',
	refreshAccess: '/refresh',
	status: '/health'
};