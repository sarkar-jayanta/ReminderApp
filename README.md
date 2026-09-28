# Reminder App

A small native React Native application for managing reminders and receiving scheduled local notifications. Reminders are stored on-device and remain available after the app is restarted.

## Features

- Create, edit, view, complete, and delete reminders.
- Chronological reminder list grouped by local calendar date.
- Swipe a reminder left to reveal its delete action; confirm before deletion.
- Local notification scheduling for future reminder dates, with a reminder ID in notification data.
- Foreground, background, and cold-start notification press handling that opens the matching reminder details.
- AsyncStorage persistence with loading, empty, error, and notification-permission states.
- Light and dark appearance following the device setting.
- Validation for blank titles, invalid times, past dates, and repeated save attempts.
- Completed reminders remain stored; completing cancels the alert, and returning a future reminder to pending schedules it again.

## Tech stack

- React Native 0.87.1, React 19, TypeScript 6
- React Navigation native stack
- AsyncStorage
- Notifee for native local notifications
- `@react-native-community/datetimepicker`
- `react-native-safe-area-context`

## Project structure

```text
src/
├── components/       # Reminder row, messages, loading, empty, and error states
├── hooks/            # Reminder state, persistence/notification orchestration
├── navigation/       # Native stack, notification navigation ref
├── screens/          # List, create/edit, and details screens
├── services/         # AsyncStorage and Notifee adapters
├── theme/            # Light/dark color tokens
├── types/            # Reminder and navigation types
└── utils/             # Date display and validation helpers
```

## Installation

Use Node.js 22.11 or newer. From the project root:

```sh
npm install
```

The native app must be rebuilt after installing native dependencies; a JavaScript reload is not sufficient.

## Running Android

1. Install Android Studio, the Android SDK matching the project’s compile SDK, and a supported JDK as described in the [React Native environment setup guide](https://reactnative.dev/docs/set-up-your-environment).
2. Start Metro in one terminal with `npm start`.
3. In another terminal, run `npm run android` with an emulator or device connected.

Android native configuration declares `POST_NOTIFICATIONS`, `RECEIVE_BOOT_COMPLETED`, and `SCHEDULE_EXACT_ALARM`. Notifee creates the `Reminders` notification channel. On Android 13 and newer, notification permission is requested when a reminder is scheduled. If exact-alarm access is unavailable, scheduling uses the non-exact fallback and the list offers a device-settings link; some alerts may then be late. Battery optimization and vendor-specific background restrictions can also affect timing.

## Running iOS

iOS builds require macOS with Xcode and CocoaPods; iOS cannot be built from this Windows workspace. On a Mac, install pods after cloning or changing native dependencies:

```sh
bundle install
bundle exec pod install
```

Then start Metro with `npm start` and run `npm run ios` from another terminal. Notifee requests iOS notification authorization at reminder creation; local calendar/time-zone behavior is provided by the native date picker and timestamp trigger.

## Notification setup and permissions

- The app asks for notification authorization when saving the first pending reminder. If authorization is denied, saving and editing still work and a clear message directs the user to device settings.
- Android notification channel creation is handled by the notification service. The app uses an app-owned monochrome small notification icon.
- Android exact alarm permission is checked before scheduling an exact `AlarmManager` trigger. If it is not enabled, Notifee uses its inexact scheduling path instead of crashing or blocking creation.
- Notifications contain `data: { reminderId: "<id>" }`. The local notification title is the reminder title.
- iOS foreground presentation options request alert, badge, and sound. Android displays the scheduled notification through the OS channel.
- Deleting or completing a reminder cancels its scheduled notification. Editing cancels the old alert and schedules a replacement when the reminder is still pending.

## Architecture decisions

- Screens render UI and delegate state changes to `RemindersProvider`/`useReminders`.
- The reminder provider coordinates persistence and notifications and keeps the list sorted; persistence and native notification APIs are isolated in separate services.
- Dates are saved as ISO strings. The native picker uses device-local date and time, and formatting uses the device locale without manual time-zone arithmetic.
- Notification permission failures are non-fatal: the reminder is preserved even if an alert cannot be scheduled.
- Storage and notification failures are logged for development, while screens show user-friendly messages.

## Technical Decisions

- **AsyncStorage was chosen** because this is a small, local-first app with a compact reminder collection and no need for a database or remote account.
- **Redux was not used** because one shared feature’s CRUD state is adequately managed by a focused context/custom hook, without global action/reducer overhead.
- **A notification service was created** to keep permissions, channel setup, scheduling, cancellation, and press-event parsing out of screens.
- **Reminder IDs are included in notification data** so the same stable identifier can route a notification press to the exact details screen.
- **Notifications are cancelled on delete/edit/completion** to prevent obsolete or duplicate alerts; edits schedule a new alert for the updated time where appropriate.
- **Native stack navigation and the built-in `PanResponder` are used** to provide native transitions and swipe-to-delete without an additional gesture dependency.

## Cold-start notification routing

The Notifee press listener is registered with the navigation tree for foreground presses. On container readiness, the app also consumes Notifee’s initial notification payload for Android cold starts. If navigation is not yet ready when a press is received, `navigationService` holds the reminder ID and navigates as soon as the container reports ready. The details screen resolves the ID against persisted reminders and shows a useful unavailable state if that reminder has since been deleted.

A single Notifee background-event handler is registered in `index.js`, as required by the library. The OS handles display of scheduled notifications while the app is backgrounded or terminated; the JS listener handles navigation after a user press when the app becomes active.

## Validation and tests

```sh
npx tsc --noEmit
npm test -- --runInBand
npm run lint
```

A manual device test checklist:

1. Create a future reminder and check the title/time in the notification.
2. Deny notification permission; confirm the reminder still saves and settings guidance appears.
3. Background the app and verify an alert at the scheduled time; tap it and confirm the exact reminder opens.
4. Terminate the app normally (not Android Settings → Force stop), then tap a delivered reminder; confirm its details screen opens after launch.
5. Create two reminders for distinct times; confirm both triggers are retained.
6. Swipe-delete a reminder and verify its alert no longer fires.
7. Edit a reminder’s time and verify the old alert is cancelled and the replacement works.
8. Complete and reopen a future reminder; verify completion persists and notifications are cancelled/recreated.
9. Try a blank title and past time; verify useful validation and no saved reminder.
10. Relaunch the app and verify reminders persist and sort chronologically.

## Known limitations

- AsyncStorage is appropriate for a small personal app, but does not provide multi-device sync, encryption, or transactional database guarantees.
- Android exact alarms may require user approval and can be restricted by device policy; inexact triggers can be delayed. OEM battery management may further delay scheduled work.
- Android explicitly force-stopping an app can suppress its alarms until the user launches it again; this is an OS restriction, not something a local-notification library can bypass.
- iOS and Android notification behavior should be tested on physical devices; simulators/emulators do not reproduce every permission, power, and delivery condition.
- iOS builds and CocoaPods installation require macOS/Xcode and could not be exercised from Windows.
- The notification service schedules one local notification per reminder; large-scale notification management and recurring reminders are outside this assignment’s scope.
#   R e m i n d e r A p p  
 