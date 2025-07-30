# Torn City Betting System

A sophisticated betting platform for Torn City faction wars using GitHub Actions and MongoDB for automatic bet confirmation.

## 🏗️ Architecture

```
GitHub Actions (Every 5 min) → Torn API → MongoDB → Frontend Checks
```

## 🚀 Features

- **Automatic Bet Confirmation**: Monitors bookie logs every 5 minutes
- **Real-time Updates**: Frontend checks MongoDB for new confirmations
- **Lead Target System**: Correctly calculates war progress based on score differences
- **Live War Data**: Real-time faction scores and war status
- **User Bet Tracking**: Personal betting history and payout tracking
- **Professional UI**: Clean, modern interface without drug emojis

## 📋 Setup Instructions

### 1. GitHub Repository Setup

1. Fork or clone this repository
2. Go to Settings → Secrets and add:
   - `BOOKIE_API_KEY`: ``
   - `MONGODB_URI`: Your MongoDB connection string

### 2. MongoDB Atlas Setup

1. Create free MongoDB Atlas account
2. Create new cluster
3. Get connection string
4. Add to GitHub secrets

### 3. GitHub Actions

The workflow runs every 5 minutes automatically:
- Fetches bookie logs from Torn API
- Stores logs in MongoDB
- Processes bet confirmations
- Updates bet status

## 🗄️ Database Schema

### Bookie Logs Collection
```javascript
{
  "_id": ObjectId("..."),
  "logId": "EdvXaLo2DzGdgjVcu3gG",
  "title": "Item receive",
  "timestamp": 1753498070,
  "category": "Item sending",
  "data": {
    "sender": 3566110,
    "items": [{"id": 206, "qty": 1}],
    "message": "BET:28655:7835:10:ABC12345"
  },
  "fetchedAt": ISODate("2024-01-15T10:30:00Z")
}
```

### Confirmed Bets Collection
```javascript
{
  "_id": ObjectId("..."),
  "betId": "ABC12345",
  "senderId": 3566110,
  "warId": "28655",
  "factionId": "7835",
  "xanaxAmount": 10,
  "logId": "EdvXaLo2DzGdgjVcu3gG",
  "timestamp": 1753498070,
  "confirmedAt": ISODate("2024-01-15T10:30:00Z"),
  "status": "confirmed"
}
```

## 🎯 Betting Process

### 1. Place Bet
1. Select war from Colosseum
2. Choose faction and Xanax amount
3. Copy bet message and bookie name
4. Send Xanax to VanillaScoop [3520571]

### 2. Automatic Confirmation
- GitHub Actions monitors logs every 5 minutes
- Detects Xanax transfers with bet messages
- Validates amounts and bet IDs
- Updates bet status in MongoDB

### 3. Frontend Updates
- Frontend checks MongoDB every 30 seconds
- Updates bet status automatically
- Shows confirmation notifications

## 📊 Cost Analysis

- **GitHub Actions**: Free for public repos
- **MongoDB Atlas**: Free tier (512MB storage)
- **Total**: $0/month vs $7-10/month for dedicated server

## 🔧 Technical Details

### GitHub Actions Workflow
```yaml
name: Monitor Bookie Logs
on:
  schedule:
    - cron: '*/5 * * * *'  # Every 5 minutes
  workflow_dispatch:  # Manual trigger
```

### Log Processing
- Fetches logs using bookie's API key
- Stores all logs in MongoDB
- Processes bet transfers automatically
- Prevents duplicate confirmations

### Frontend Integration
- Checks MongoDB for new confirmations
- Updates bet status in real-time
- Shows live war data and scores

## 🛡️ Security

- API keys stored as GitHub secrets
- MongoDB connection string encrypted
- Rate limiting respects Torn API limits
- No sensitive data in code

## 📈 Benefits

1. **Cost-Effective**: Nearly free compared to dedicated server
2. **Reliable**: GitHub Actions has 99.9% uptime
3. **Scalable**: MongoDB Atlas handles scaling
4. **Simple**: No server maintenance required
5. **Audit Trail**: Complete history of all logs
6. **Rate Limit Safe**: 5-minute intervals respect API limits

## 🚀 Deployment

### Manual Trigger
1. Go to Actions tab in GitHub
2. Select "Monitor Bookie Logs"
3. Click "Run workflow"

### Automatic Schedule
- Runs every 5 minutes automatically
- No manual intervention required
- Monitors 24/7

## 📝 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📞 Support

For issues or questions:
- Create GitHub issue
- Check Actions tab for workflow status
- Monitor MongoDB for data integrity 
