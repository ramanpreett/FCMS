# Meetings Management

This module provides comprehensive meeting management functionality for the ClientPulse application.

## Features

### 📅 **Meeting Scheduling**
- Schedule meetings with specific clients
- Set date and time for meetings
- Add detailed notes and agenda
- Support for recurring meetings (weekly, bi-weekly, monthly)

### 📋 **Meeting Management**
- View all scheduled meetings
- Edit meeting details (for upcoming meetings only)
- Delete meetings with confirmation
- Automatic sorting by date

### 🎯 **Smart Status Tracking**
- **Upcoming**: Meetings scheduled for future dates
- **Completed**: Past meetings (read-only)
- **Today**: Special highlighting for today's meetings

### 🔄 **Recurring Meetings**
- Weekly meetings
- Bi-weekly meetings  
- Monthly meetings
- Visual indicators for recurring meetings

## Components

### `Meetings.js` - Main Component
- Manages meeting state and API calls
- Handles form display logic
- Coordinates between form and list components

### `MeetingForm.js` - Form Component
- Comprehensive meeting creation/editing form
- Client selection dropdown
- Date and time pickers
- Notes textarea
- Recurring meeting options
- Edit mode support

### `MeetingList.js` - List Component
- Displays all meetings in chronological order
- Status badges (Upcoming/Completed)
- Recurring meeting indicators
- Edit and delete actions
- Responsive design

## API Endpoints

- `GET /api/meetings` - Fetch all meetings
- `POST /api/meetings` - Create new meeting
- `PATCH /api/meetings/:id` - Update meeting
- `DELETE /api/meetings/:id` - Delete meeting

## Data Model

```javascript
{
  client: ObjectId,        // Reference to Client
  date: Date,             // Meeting date and time
  notes: String,          // Meeting notes/agenda
  recurring: Boolean,     // Is recurring meeting
  recurringType: String   // 'weekly', 'biweekly', 'monthly'
}
```

## Usage

1. **Schedule Meeting**: Click "Schedule Meeting" button
2. **Fill Form**: Select client, set date/time, add notes
3. **Set Recurring**: Optionally enable recurring meetings
4. **Save**: Meeting is created and displayed in list
5. **Edit**: Click "Edit" on upcoming meetings
6. **Delete**: Click "Delete" with confirmation

## Future Enhancements

- Google Calendar integration
- Email notifications
- Meeting reminders
- Video call links
- Meeting templates
- Calendar view


