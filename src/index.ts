import dotenv from 'dotenv';
import EnvValidator from "./classes/Internal/EnvValidator.js";
import Announcer from "./classes/Internal/Announcer.js";

dotenv.config();
new EnvValidator().validate();
new Announcer().start(Number(process.env.CHECK_FREQUENCY_IN_MINUTES));
