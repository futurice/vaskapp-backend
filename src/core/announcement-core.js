'use strict';

import * as _ from 'lodash';
import * as Facebook from '../util/fb';

function getAnnouncements() {
  const announcements = Facebook.getAnnouncements();
  if (_.isEmpty(announcements)) {
    return Promise.resolve([]);
  } else {
    return Promise.resolve(announcements[0]);
  }
}

export {
  getAnnouncements
};
