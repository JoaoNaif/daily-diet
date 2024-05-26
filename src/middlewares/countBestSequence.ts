import { Meal } from "../@types/Meal";

export const countBestSequence = async (meals: Meal[]) => {
    let maxSequence: Meal[] = [];
    let currentSequence: Meal[] = [];

        for (const meal of meals) {
            if (meal.is_in_diet === 1) {
                currentSequence.push(meal);
                if (currentSequence.length > maxSequence.length) {
                    maxSequence = currentSequence;
                }
            } else {
                currentSequence = [];
            }
        }

    return maxSequence    
}