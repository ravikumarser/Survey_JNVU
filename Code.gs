function doGet(e) {
  // Return the question configuration
  const config = [
    {
      id: 'S1',
      title: 'Greeting & Identification',
      text: "Hello, Friend! Ready for the upcoming event? Before we dive in, Please provide your full name",
      type: 'text',
      required: true,
      next: 'S2'
    },
    {
      id: 'S2',
      title: 'Mobile Number',
      text: "Awesome. Please enter your valid mobile number",
      type: 'number',
      required: true,
      next: 'S3'
      
    },
    {
      id: 'S3',
      title: 'T-Shirt Size',
      text: "Awesome. Provide your T-Shirt Size (Medium,Large,Extra Large)",
      type: 'text',
      required: true,
      next: 'S4'
    },
    {
      id: 'S4',
      title: 'Confirmation',
      text: "Got it. Are you attending this event?",
      type: 'choice',
        options: ['Yes', 'No'],
        next: {
            'Yes': 'S5',
            'No': 'S6'
        }
    },
    {
      id: 'S5',
      title: 'pick up',
      text: "Awesome!, Do you need a pick up?",
      type: 'choice',
        options: ['Yes', 'No'],
        next: {
            'Yes': 'S6',
            'No': 'S7'
        }
    },
    {
      id: 'S6',
      title: 'pick point',
      text: "Please provide the pickup point along with city details",
      type: 'text',
      next: 'S7'
    },
    {
      id: 'S7',
      title: 'Address details',
      text: "Please try to come!, Please enter your address details as a last thing!",
      type: 'text',
      next: 'S8'
    },
    {
      id: 'S8',
      title: 'Thank You & Submit',
      text: "You're All Set! Thank you for the JNVU milana 2025. We can't wait to see you!",
      type: 'end'
    }
  ];
  
  return ContentService.createTextOutput(JSON.stringify(config))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const ss = SpreadsheetApp.openById('1byjrj82Q_Tahs_Iv5z86YvXxyI-DGT-yTghZd3zPL6c');
  const sheetName = 'Event RSVPs - June 2025';
  let sheet = ss.getSheetByName(sheetName);
  
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.appendRow(['Timestamp', 'Full Name', 'Mobile Number', 'T-Shirt Size', 'Attending', 'Pick Up Needed', 'Pick Up Point', 'Address']);
  }
  
  try {
    const data = JSON.parse(e.postData.contents);
    
    // Default values for missing fields
    const row = [
      new Date(),
      data.S1 || '',
      data.S2 || '',
      data.S3 || '',
      data.S4 || '',
      data.S5 || '',
      data.S6 || '',
      data.S7 || ''
    ];
    
    sheet.appendRow(row);
    
    return ContentService.createTextOutput(JSON.stringify({ result: 'success', message: 'RSVP confirmed!' }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ result: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
