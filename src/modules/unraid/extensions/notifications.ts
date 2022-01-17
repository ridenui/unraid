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

export type NotificationCount = {
  unread: number;
  archived: number;
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
    const [{ code: unreadCode, stdout: unreadOut }, { code: archivedCode, stdout: archivedOut }] = await Promise.all([
      this.instance.execute(`ls -1 /tmp/notifications/unread/`),
      this.instance.execute(`ls -1 /tmp/notifications/archive/`),
    ]);

    if (archivedCode + unreadCode !== 0) throw new Error('Got non-zero exit code while listing notifications');

    const parsedNotifications: RichNotification[] = [];

    const loadNotifications = (sources: string[], isArchived: boolean) => {
      return Promise.all(
        sources.map((source) =>
          (async () => {
            const notificationType = isArchived ? 'archive' : 'unread';
            const { code, stdout } = await this.instance.execute(
              `cat /tmp/notifications/${notificationType}/${source}`
            );
            if (code === 0) {
              parsedNotifications.push(parseNotification(stdout, source, isArchived));
            }
          })()
        )
      );
    };

    await Promise.all([loadNotifications(unreadOut, false), loadNotifications(archivedOut, true)]);

    return parsedNotifications.sort((a, b) => {
      if (a.created < b.created) return -1;
      if (a.created > b.created) return 1;
      return 0;
    });
  }

  /**
   * Returns UNRAID Notification count.
   */
  async getNotificationCount(): Promise<NotificationCount> {
    const [{ code: unreadCode, stdout: unreadOut }, { code: archivedCode, stdout: archivedOut }] = await Promise.all([
      this.instance.execute(`ls -1 /tmp/notifications/unread/`),
      this.instance.execute(`ls -1 /tmp/notifications/archive/`),
    ]);

    return {
      archived: archivedCode === 0 ? archivedOut.length : 0,
      unread: unreadCode === 0 ? unreadOut.length : 0,
    };
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
