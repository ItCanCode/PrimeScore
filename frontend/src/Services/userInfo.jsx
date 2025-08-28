async function handleSave(username, bio, picture) {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("https://prime-backend.azurewebsites.net/api/users/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username,
          bio,
          picture
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setUser(data.user); 
        setIsEditing(false);
      } 
      else {
        console.error(data.error);
      }
    } 
    catch (err) {
        console.error(err);
    }
}