using System.IO;
using Microsoft.AspNetCore.Mvc;

var builder = WebApplication.CreateBuilder(args);


var app = builder.Build();

app.UseStaticFiles(new StaticFileOptions{
    OnPrepareResponse = ctx =>
    {
        // Restreindre les fichiers accessibles à certaines extensions
        var allowedExtensions = new[] { ".html", ".js", ".css", ".png", ".glb" };
        var ext = Path.GetExtension(ctx.File.Name).ToLowerInvariant();
        if (!allowedExtensions.Contains(ext))
        {
            ctx.Context.Response.StatusCode = 403; // Refuser l'accès
            ctx.Context.Response.Body = Stream.Null;
        }
    }
});

app.MapGet("/", () => Results.Redirect("./index.html"));

app.Run();
