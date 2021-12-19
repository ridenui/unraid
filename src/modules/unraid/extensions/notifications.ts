import * as Process from 'process';
import { Executor } from '../../../instance/executor';
import { UnraidModuleExtensionBase } from '../unraid-module-extension-base';

type NotificationImportance = 'alert' | 'warning' | 'normal';

export type RichNotification = {
  fileName: string;
  created: Date;
  event: string;
  subject: string;
  description: string;
  importance: NotificationImportance;
  isArchived: boolean;
};

function parseNotificationLine(notification: string) {
  const splitted = notification.split('=');
  splitted.shift();
  return splitted.join('');
}

function parseNotification(notificationFile: string[], fileName: string, isArchived: boolean) {
  const [timestamp, event, subject, description, importance] = notificationFile;
  const unixTimestamp = parseInt(parseNotificationLine(timestamp), 10) * 1000;
  return {
    fileName,
    created: new Date(unixTimestamp),
    event: parseNotificationLine(event),
    subject: parseNotificationLine(subject),
    description: parseNotificationLine(description),
    importance: parseNotificationLine(importance) as NotificationImportance,
    isArchived,
  };
}

export class UnraidModuleNotificationExtension<
  ExecutorConfig,
  Ex extends Executor<ExecutorConfig>
> extends UnraidModuleExtensionBase<ExecutorConfig, Ex> {
  /**
   * Returns UNRAID Notifications sorted by date.
   */
  async getNotifications(): Promise<RichNotification[]> {
    const { code: unreadCode, stdout: unreadOut } = await this.instance.execute(`ls -1 /tmp/notifications/unread/`);
    const { code: archivedCode, stdout: archivedOut } = await this.instance.execute(
      `ls -1 /tmp/notifications/archive/`
    );
    if (archivedCode + unreadCode !== 0) throw new Error('Got non-zero exit code while listing notifications');

    const parsedNotifications: RichNotification[] = [];

    /* eslint-disable no-restricted-syntax, no-await-in-loop */
    for (const notification of unreadOut) {
      const { code, stdout } = await this.instance.execute(`cat /tmp/notifications/unread/${notification}`);
      if (code === 0) {
        parsedNotifications.push(parseNotification(stdout, notification, false));
      }
    }

    for (const notification of archivedOut) {
      const { code, stdout } = await this.instance.execute(`cat /tmp/notifications/archive/${notification}`);
      if (code === 0) {
        parsedNotifications.push(parseNotification(stdout, notification, true));
      }
    }
    /* eslint-enable no-restricted-syntax, no-await-in-loop */

    return parsedNotifications.sort((a, b) => {
      if (a.created < b.created) return -1;
      if (a.created > b.created) return 1;
      return 0;
    });
  }

  async deleteNotification(notificationName: string, isArchived: boolean): Promise<void> {
    const { code } = await this.instance.execute(
      `rm /tmp/notifications/${isArchived ? 'archive' : 'unread'}/${notificationName}`
    );
    if (code !== 0) throw new Error('Got non-zero exit code while deleting notification');
  }

  async toggleNotificationArchiveState(notificationName: string, isArchived: boolean): Promise<void> {
    const { code } = await this.instance.execute(
      `mv /tmp/notifications/${isArchived ? 'archive' : 'unread'}/${notificationName} /tmp/notifications/${
        isArchived ? 'unread' : 'archive'
      }/${notificationName}`
    );
    if (code !== 0) throw new Error('Got non-zero exit code while toggling archive state');
  }
}
