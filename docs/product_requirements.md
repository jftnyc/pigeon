# Shared Contact Book - Product Requirements Document

## Overview
A mobile-first web application that serves as a shared contact book for friends, allowing users to maintain and share their contact information, availability, and location with their connected friends.

## Core Features

### 1. User Authentication & Connection Management
- User registration and login system
- Friend connection system
  - Send/receive friend requests
  - Accept/reject friend requests
  - View pending friend requests
  - Remove friends
- Privacy controls: Only connected friends can view shared information

### 2. Contact Information Management
#### Standard Fields
- Phone number
- Email address
- Mailing address
- Birthday
- Current location
- Availability schedule

#### Custom Fields
- Users can create custom fields for their contacts
- Custom fields are private to the creator
- Custom fields can be of different types (text, date, number, etc.)

### 3. Availability Management
#### Weekly Schedule
- Customizable availability for each day of the week
- Time slot selection for each day
- Option to set recurring availability patterns

#### Manual Availability Override
- Quick toggle to mark self as available
- Set duration for manual availability
- Automatic reversion to scheduled availability after duration expires

### 4. Contact List View
- List of all connected friends
- Availability status indicator
  - Green: Currently available
  - Red: Currently unavailable
- Quick access to contact details
- Search and filter functionality

### 5. Map View
- Interactive map showing all connected friends' locations
- Location pins for each friend
- Click on pin to view friend's details
- Option to center map on user's location
- Zoom and pan controls

### 6. Notifications System
- Real-time notifications for:
  - Friend request updates
  - Contact information changes
  - Availability status changes
  - Location updates
- Notification center/history
- Notification preferences

## Technical Requirements

### Frontend
- Mobile-first responsive design
- Progressive Web App (PWA) capabilities
- Real-time updates using WebSocket
- Offline capability for basic features
- Map integration (Google Maps or similar)

### Backend
- RESTful API architecture
- Real-time data synchronization
- Secure authentication system
- Data encryption for sensitive information
- Geolocation services
- Push notification system

### Data Models

#### User
```json
{
  "id": "string",
  "email": "string",
  "name": "string",
  "phone": "string",
  "address": "string",
  "birthday": "date",
  "location": {
    "latitude": "number",
    "longitude": "number",
    "lastUpdated": "datetime"
  },
  "availability": {
    "schedule": {
      "monday": ["timeSlots"],
      "tuesday": ["timeSlots"],
      // ... other days
    },
    "manualOverride": {
      "isAvailable": "boolean",
      "expiresAt": "datetime"
    }
  },
  "customFields": {
    "fieldId": {
      "name": "string",
      "type": "string",
      "value": "any"
    }
  }
}
```

#### Connection
```json
{
  "id": "string",
  "user1Id": "string",
  "user2Id": "string",
  "status": "string", // pending, accepted, rejected
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

#### Notification
```json
{
  "id": "string",
  "userId": "string",
  "type": "string", // friendRequest, infoUpdate, availabilityChange, locationUpdate
  "data": "object",
  "read": "boolean",
  "createdAt": "datetime"
}
```

## User Interface Requirements

### Screens
1. Authentication Screens
   - Login
   - Registration
   - Password Reset

2. Main Navigation
   - Contact List
   - Map View
   - Notifications
   - Profile/Settings

3. Contact Management
   - Contact Details
   - Edit Contact
   - Add Custom Fields
   - Availability Schedule

4. Map Interface
   - Full-screen map
   - Friend location markers
   - Location details popup

5. Notification Center
   - List of notifications
   - Notification details
   - Notification settings

## Security Requirements
- End-to-end encryption for sensitive data
- Secure authentication
- Data privacy compliance
- Regular security audits
- Rate limiting for API calls
- Input validation and sanitization

## Performance Requirements
- Page load time < 2 seconds
- Real-time updates < 1 second delay
- Map rendering < 3 seconds
- Support for 1000+ contacts
- Offline functionality for basic features

## Future Considerations
- Group availability scheduling
- Event planning integration
- Calendar sync
- Social media integration
- Contact import/export
- Multi-language support 