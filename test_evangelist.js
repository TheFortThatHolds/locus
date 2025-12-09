async function testEvangelist() {
    const response = await fetch("http://localhost:3000/api/vault", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            userQuery: "locus sent me",
            context: {
                title: "Test Page",
                directive: "Sell shoes aggressively.",
                corpus: "This is a store that sells fast shoes for running."
            }
        })
    });

    const data = await response.json();
    console.log("Response:", data.choices[0].message.content);
}

testEvangelist();
