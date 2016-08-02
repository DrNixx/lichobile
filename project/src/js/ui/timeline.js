import router from '../router';
import redraw from '../utils/redraw';
import { timeline as timelineXhr } from '../xhr';
import { gameIcon, handleXhrError } from '../utils';
import { header as headerWidget, backButton } from './shared/common';
import helper from './helper';
import layout from './layout';
import i18n from '../i18n';
import m from 'mithril';

export const supportedTypes = ['follow', 'game-end', 'tour-join'];

export default {
  oninit(vnode) {
    const timeline = m.prop([]);

    timelineXhr()
    .run(data => {
      timeline(data.entries.filter(o => supportedTypes.indexOf(o.type) !== -1));
      redraw();
    })
    .catch(handleXhrError);

    vnode.state = {
      timeline
    };
  },

  view(vnode) {
    const ctrl = vnode.state;
    const header = headerWidget.bind(undefined, null, backButton(i18n('timeline')));
    return layout.free(header, renderBody.bind(undefined, ctrl));
  }
};

function renderBody(ctrl) {
  return (
    <ul className="timeline native_scroller page">
      {ctrl.timeline().map(e => {
        if (e.type === 'follow') {
          return renderFollow(e);
        } else if (e.type === 'game-end') {
          return renderGameEnd(e);
        } else if (e.type === 'tour-join') {
          return renderTourJoin(e);
        }
        return null;
      })}
    </ul>
  );
}

export function renderTourJoin(entry) {
  const fromNow = window.moment(entry.date).fromNow();
  const entryText = i18n('xCompetesInY', entry.data.userId, entry.data.tourName);
  const key = 'tour' + entry.date;

  return (
    <li className="list_item timelineEntry" key={key}
      oncreate={helper.ontouchY(() => {
        router.set('/tournament/' + entry.data.tourId);
      })}
    >
      <span className="fa fa-trophy" />
      {m.trust(entryText.replace(/^(\w+)\s/, '<strong>$1&nbsp;</strong>'))}
      <small><em>&nbsp;{fromNow}</em></small>
    </li>
  );
}

export function renderFollow(entry) {
  const fromNow = window.moment(entry.date).fromNow();
  const entryText = i18n('xStartedFollowingY', entry.data.u1, entry.data.u2);
  const key = 'follow' + entry.date;

  return (
    <li className="list_item timelineEntry" key={key}
      oncreate={helper.ontouchY(() => {
        router.set('/@/' + entry.data.u1);
      })}
    >
      <span className="fa fa-arrow-circle-right" />
      {m.trust(entryText.replace(/^(\w+)\s/, '<strong>$1&nbsp;</strong>'))}
      <small><em>&nbsp;{fromNow}</em></small>
    </li>
  );
}

export function renderGameEnd(entry) {
  const icon = gameIcon(entry.data.perf);
  const result = entry.data.win ? 'Victory' : 'Defeat';
  const fromNow = window.moment(entry.date).fromNow();
  const key = 'game-end' + entry.date;

  return (
    <li className="list_item timelineEntry" key={key} data-icon={icon}
      oncreate={helper.ontouchY(() => {
        router.set('/game/' + entry.data.playerId);
      })}
    >
      <strong>{result}</strong> vs. {entry.data.opponent}
      <small><em>&nbsp;{fromNow}</em></small>
    </li>
  );
}
