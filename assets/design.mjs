export const design = { id: 'evergreen-letter', name: 'The Evergreen Letter' };
export const sample = (now = new Date()) => {
  const y = now.getUTCFullYear() + (now >= new Date(Date.UTC(now.getUTCFullYear(),11,24,18,30)) ? 1 : 0);
  return { host:'Clara & James', title:'Christmas Dinner', date:y+'-12-24', time:'18:30', venue:'Somerset House, Strand, London', message:'Come in from the cold for a candlelit evening of good food, familiar faces and a little Christmas cheer.', zone:'Europe/London', instant:y+'-12-24T18:30:00.000Z', design:design.id };
};
export const faqs = [
  ['Is Everpost free to use?', 'Yes. Creating an invitation, sharing the link, downloading the card and collecting guest replies are all free.'],
  ['Do my guests need an account?', 'No. Guests open your link in their browser and can reply right there, on a phone, tablet or computer.'],
  ['Can I use the design for New Year’s Eve?', 'Yes. The Evergreen Letter works for both holidays. Change the title, date and message to suit your celebration.'],
  ['How do I send my invitation?', 'After creating your invitation, copy its guest link or choose Share on WhatsApp. You can also download a PNG to send alongside the link.'],
  ['Where can I see RSVPs and wishes?', 'Save the private host link shown after creation. Open it on any device to read replies and see how many people are coming.'],
  ['Can guests add the party to their calendar?', 'Yes. The invitation includes a Google Calendar link and an .ics file for Apple Calendar, Outlook and other calendar apps.'],
  ['Who can see my invitation?', 'Anyone with the guest link can see your event details. Only people with the separate host link can read the replies.']
];
export const escapeHtml = (value='') => String(value).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
