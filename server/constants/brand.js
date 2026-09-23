// Server-side twin of client/src/constants/brand.js. The two packages can't
// share a module, so anything that changes here changes there too.
//
// Note: this only controls the name *inside* the message body. The sender
// display name comes from SENDER_EMAIL in the environment (see
// config/nodemailer.js) and has to be updated there separately.
export const ACADEMY_NAME = "Prominent Promise Impact Network Academy";
