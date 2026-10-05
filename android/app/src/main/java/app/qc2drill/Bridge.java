package app.qc2drill;

import android.app.Activity;
import android.app.NotificationManager;
import android.content.Context;
import android.content.pm.PackageManager;
import android.os.Build;
import android.webkit.JavascriptInterface;

/**
 * Web（index.html）から呼ぶアプリ側の機能。JavaScript では window.QC2App として見える。
 */
public class Bridge implements Runnable {
    private final Activity act;

    Bridge(Activity act) {
        this.act = act;
    }

    /** リマインダーのオン／オフと時刻を保存して予約し直す。オンにしたとき、必要なら通知の許可を求める */
    @JavascriptInterface
    public void setReminder(boolean on, int h, int m) {
        try {
            act.getSharedPreferences(Reminder.PREFS, Context.MODE_PRIVATE).edit()
                    .putBoolean("on", on).putInt("h", h).putInt("m", m).apply();
            Reminder.schedule(act);
            if (on) act.runOnUiThread(this);
        } catch (Throwable ignored) {
        }
    }

    /** 今日の解答数・目標・連続日数を保存する（通知を出すかどうかの判断に使う） */
    @JavascriptInterface
    public void setStatus(String day, int today, int goal, int streak) {
        try {
            act.getSharedPreferences(Reminder.PREFS, Context.MODE_PRIVATE).edit()
                    .putString("day", day).putInt("today", today).putInt("goal", goal).putInt("streak", streak).apply();
        } catch (Throwable ignored) {
        }
    }

    /** 通知が許可されているか（Android の設定でオフにされていれば false） */
    @JavascriptInterface
    public boolean notifAllowed() {
        try {
            NotificationManager nm = (NotificationManager) act.getSystemService(Context.NOTIFICATION_SERVICE);
            return nm.areNotificationsEnabled();
        } catch (Throwable t) {
            return false;
        }
    }

    /** 動作確認用：いますぐ通知を1件出す */
    @JavascriptInterface
    public void testNotify() {
        try {
            Reminder.notify(act, "通知のテストです。毎日この形でお知らせします。");
        } catch (Throwable ignored) {
        }
    }

    /** UI スレッドで通知の許可を求める（Android 13 以降） */
    @Override
    public void run() {
        if (Build.VERSION.SDK_INT >= 33
                && act.checkSelfPermission("android.permission.POST_NOTIFICATIONS") != PackageManager.PERMISSION_GRANTED) {
            act.requestPermissions(new String[]{"android.permission.POST_NOTIFICATIONS"}, 1);
        }
    }
}
