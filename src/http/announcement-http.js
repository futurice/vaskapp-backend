import * as announcementCore from '../core/announcement-core';
import {createJsonRoute} from '../util/express';

const getAnnouncements = createJsonRoute(function(req, res) {
  return announcementCore.getAnnouncements();
});

export {
  getAnnouncements
};
