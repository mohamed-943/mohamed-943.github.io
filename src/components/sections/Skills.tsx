import { skills } from '../../data/skills'
import './skills.css'

export default function Skills() {
  return (
    <section className="section skills" id="competences" aria-labelledby="competences-title">
      <div className="wrap">
        <div className="section-head">
          <h2 className="section-title" id="competences-title">
            Compétences
          </h2>
          <p className="section-lead">
            Les outils que j’ai utilisés en stage ou en projet. Ceux en pointillés sont en cours d’apprentissage.
          </p>
        </div>
        <dl className="sk-list">
          {skills.map((g) => (
            <div className="sk-row" key={g.name}>
              <dt>{g.name}</dt>
              <dd>
                <ul>
                  {g.items.map((s) => (
                    <li className="tag" key={s}>
                      {s}
                    </li>
                  ))}
                  {g.learning?.map((s) => (
                    <li className="tag tag-learning" key={s}>
                      {s}
                      <span className="sr-only"> (en apprentissage)</span>
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
