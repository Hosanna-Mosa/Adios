// Layout constants for the home promo carousel. Shared because the screen
// needs STRIDE for its scroll maths and the stylesheet needs the card width
// and gap -- keeping one copy stops the two drifting apart.

export const CARD_W = 280;
export const CARD_GAP = 12;
export const STRIDE = CARD_W + CARD_GAP;
