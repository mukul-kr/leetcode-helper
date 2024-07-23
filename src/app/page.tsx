import Card from '@/components/card.component';
import questions from '../../public/questions.json'
export default function Home() {
  
  // console.log(questions.files)

  return (
    <>
      <header></header>
      <main className="flex min-h-screen flex-col items-center justify-between p-6">
        {questions.files.map((company, index) => (
          <Card company_name={company} key={index}/>
        ))}

      </main>
      <footer></footer>
    </>
  );
}
