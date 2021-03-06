import { v4 as uuid } from "uuid";
import log from '../../logging';

export default class ResonatorStats {
    constructor({
        resonator_id,
        criteria
    }) {
        this.resonator_id = resonator_id;
        this.criteria = criteria;
    }

    addAnswer({question_id, resonator_question_id, sent_resonator_id, answer_id}) {
        let answers = this.criteria[question_id];

        if (!answers)
            answers = this.criteria[question_id] = [];

        if (answers.find(a => a.sent_resonator_id === sent_resonator_id)) {
            log.warn(`Trying to add an answer to an existing sent resonator: ${sent_resonator_id}`);
            return;
        }

        answers.unshift({
            id: uuid(),
            resonator_question_id,
            sent_resonator_id,
            answer_id
        });
    }
}
