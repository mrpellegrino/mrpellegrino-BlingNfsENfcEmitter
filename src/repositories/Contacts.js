import { Contact } from '../models';

export async function saveContact(contactData) {
    try {
        const contact = await Contact.findOne({ where: { id: contactData.id } });
        
        if (contact) {
            return await contact.update(contactData);
        }
        
        return await Contact.create(contactData);
    } catch (error) {
        console.error('Error saving contact:', error);
        throw error;
    }
}
