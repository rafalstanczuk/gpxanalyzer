# Privacy Policy

**Effective Date:** October 27, 2025

**Developer:** Rafał Stańczuk

**Contact:** anddev0110@gmail.com

---

## Introduction

GpxAnalyzer ("the App") is a post-processing tool designed to analyze and visualize GPS data from GPX files. This privacy policy explains how the App handles user data in compliance with Google Play Developer Program policies and applicable privacy laws.

**Important:** This App does NOT track your current location. It only processes historical GPS data from GPX files that you choose to load.

---

## Data Collection and Usage

### Overview

GpxAnalyzer is designed with privacy in mind. The App operates primarily locally on your device and does not collect personal information for tracking or advertising purposes.

### Types of Data Accessed

#### 1. File Storage Data
- **What:** GPX files stored on your device
- **Why:** To read and process GPS track data for visualization and analysis
- **How:** Through Android storage permissions (READ_EXTERNAL_STORAGE, READ_MEDIA_IMAGES/VIDEO/AUDIO, or MANAGE_EXTERNAL_STORAGE depending on Android version)
- **Storage:** Files are read from your device storage
- **Sharing:** No data is shared with third parties
- **Retention:** Data is processed in memory and not permanently stored by the App

#### 2. Historical Location Data (from GPX files)
- **What:** GPS coordinates, timestamps, and elevation data contained in GPX files
- **Why:** To visualize routes on maps and generate charts (altitude, velocity)
- **How:** Extracted from GPX files you select
- **Storage:** Processed locally on your device, cached temporarily in device memory
- **Sharing:** Never shared with third parties
- **Retention:** Cached data is cleared when the App is closed or when you load a different file

#### 3. Strava Activity Data (Optional)
- **What:** Activity data from your Strava account (location, time, elevation, activity metadata)
- **Why:** To import and analyze your Strava activities
- **How:** Through OAuth 2.0 authentication with Strava API
- **Storage:** 
  - OAuth tokens stored securely on your device
  - Activity data fetched and converted to GPX format, processed locally
- **Sharing:** 
  - Data is fetched from Strava API (subject to Strava's privacy policy)
  - Data is never shared with third parties beyond what is necessary for Strava API functionality
  - Data is only displayed to you (the authenticated user)
- **Retention:** 
  - OAuth tokens stored until you revoke access
  - Activity data cached temporarily in device memory
- **Control:** You can revoke access anytime through Strava settings

#### 4. Network Data
- **What:** Internet connection required for:
  - Strava API integration (when used)
  - OpenStreetMap tile downloads for map display
- **Why:** To fetch Strava activities and display map tiles
- **How:** Through INTERNET permission
- **Storage:** Map tiles cached locally by the map library
- **Sharing:** 
  - Strava API requests subject to Strava's privacy policy
  - OpenStreetMap tile requests subject to OpenStreetMap Foundation privacy policy
- **Retention:** Map tiles cached temporarily by the map library

---

## Data Handling and Security

### Secure Data Handling

- **Local Processing:** All GPX data processing occurs locally on your device
- **No Server Transmission:** GPX file data is never transmitted to external servers
- **Encrypted Communication:** When connecting to Strava API, all communication uses HTTPS (TLS encryption)
- **Secure Token Storage:** OAuth tokens are stored securely on your device using Android's secure storage mechanisms
- **No Data Collection:** The App does not collect analytics, usage statistics, or personal information

### Data Retention

- **GPX File Data:** Processed in memory only, cleared when App is closed or new file is loaded
- **Strava Data:** Cached temporarily in device memory, cleared when App is closed
- **OAuth Tokens:** Stored on device until you revoke access through Strava settings
- **Map Tiles:** Cached by the map library, subject to library's cache management

### Data Deletion

- **No Account Required:** The App does not require account creation, so there is no account data to delete
- **Clear App Data:** You can delete all App data at any time by:
  - Uninstalling the App (removes all local data including OAuth tokens)
  - Clearing App data through Android Settings
- **Revoke Strava Access:** You can revoke Strava access at any time through Strava settings, which will invalidate stored OAuth tokens

---

## Third-Party Services

### OpenStreetMap
- **Purpose:** Map tile display
- **Data Shared:** Map tile requests (your IP address may be visible to OpenStreetMap servers)
- **Privacy Policy:** [OpenStreetMap Foundation Privacy Policy](https://wiki.osmfoundation.org/wiki/Privacy_Policy)

### Strava API
- **Purpose:** Import activity data (optional feature)
- **Data Shared:** OAuth authentication and activity data requests (subject to Strava API Agreement)
- **Privacy Policy:** [Strava Privacy Policy](https://www.strava.com/legal/privacy)
- **API Agreement:** [Strava API Agreement](https://www.strava.com/legal/api)
- **Note:** If Strava data originates from Garmin devices, attribution to Garmin may be required per Strava's terms.

---

## Permissions Used

The App requests the following permissions:

1. **Storage Permissions** (varies by Android version):
   - Android 13+: READ_MEDIA_IMAGES, READ_MEDIA_VIDEO, READ_MEDIA_AUDIO, MANAGE_EXTERNAL_STORAGE
   - Android 11-12: READ_EXTERNAL_STORAGE, MANAGE_EXTERNAL_STORAGE
   - Android 10 and below: READ_EXTERNAL_STORAGE, WRITE_EXTERNAL_STORAGE
   - **Purpose:** To read GPX files from device storage

2. **Internet Permission:**
   - **Purpose:** To connect to Strava API (when used) and download OpenStreetMap tiles

**Note:** The App does NOT request location permissions. It does not track your current location. It only processes historical GPS data from GPX files you choose to load.

---

## Your Rights

- **Full Control:** You have full control over your data
- **No Tracking:** The App does not track you or collect personal information
- **No Account Required:** No registration or account creation needed
- **Delete Anytime:** You can delete the App and all associated data at any time
- **Revoke Access:** You can revoke Strava access at any time through Strava settings

---

## Children's Privacy

The App is not directed to children under the age of 13. The App does not knowingly collect personal information from children.

---

## Changes to This Privacy Policy

This privacy policy may be updated periodically to reflect changes in the App's functionality or legal requirements. The effective date will be updated accordingly. Continued use of the App after changes constitutes acceptance of the updated policy.

---

## Contact

If you have questions about this privacy policy or how the App handles your data, please contact:

**Developer:** Rafał Stańczuk  
**Email:** anddev0110@gmail.com

You can also contact through the App repository or distribution platform where you obtained the App.

---

## Compliance

This privacy policy complies with:
- Google Play Developer Program Policies ([User Data Policy](https://support.google.com/googleplay/android-developer/answer/10144311))
- Applicable privacy and data protection laws
- Strava API Agreement requirements

---

*Last Updated: October 27, 2025*

