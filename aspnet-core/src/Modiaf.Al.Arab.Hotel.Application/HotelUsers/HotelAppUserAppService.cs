using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Volo.Abp;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;
namespace Modiaf.Al.Arab.Hotel.HotelUsers;

[AllowAnonymous]
public class HotelAppUserAppService(IRepository<HotelAppUser, int> repository)
    : CrudAppService<HotelAppUser, HotelAppUserDto, int, PagedAndSortedResultRequestDto, CreateUpdateHotelAppUserDto>(
        repository),
        IHotelAppUserAppService
{
    protected override async Task<IQueryable<HotelAppUser>> CreateFilteredQueryAsync(
        PagedAndSortedResultRequestDto input)
    {
        var query = await ReadOnlyRepository.GetQueryableAsync();
        return query.OrderBy(x => x.UserName);
    }

    public override async Task<HotelAppUserDto> CreateAsync(CreateUpdateHotelAppUserDto input)
    {
        if (string.IsNullOrWhiteSpace(input.Password))
        {
            throw new UserFriendlyException("كلمة المرور مطلوبة عند إنشاء مستخدم جديد.");
        }

        return await base.CreateAsync(input);
    }

    protected override HotelAppUserDto MapToGetOutputDto(HotelAppUser entity) =>
        new()
        {
            Id = entity.Id,
            FirstName = entity.FirstName,
            LastName = entity.LastName,
            UserName = entity.UserName,
            Email = entity.Email,
            PhoneNumber = entity.PhoneNumber,
            Password = entity.Password,
            Role = entity.Role,
            AllowNavigation = entity.AllowNavigation,
            LandingPagePath = entity.LandingPagePath,
        };

    protected override HotelAppUser MapToEntity(CreateUpdateHotelAppUserDto createInput)
    {
        var entity = new HotelAppUser(
            createInput.FirstName.Trim(),
            createInput.LastName.Trim(),
            createInput.UserName.Trim(),
            (createInput.Email ?? string.Empty).Trim(),
            (createInput.PhoneNumber ?? string.Empty).Trim(),
            createInput.Password,
            createInput.Role);
        entity.AllowNavigation = createInput.AllowNavigation;
        entity.LandingPagePath = NormalizeLandingPagePath(createInput.LandingPagePath);
        return entity;
    }

    protected override void MapToEntity(CreateUpdateHotelAppUserDto updateInput, HotelAppUser entity)
    {
        entity.FirstName = updateInput.FirstName.Trim();
        entity.LastName = updateInput.LastName.Trim();
        entity.UserName = updateInput.UserName.Trim();
        entity.Email = (updateInput.Email ?? string.Empty).Trim();
        entity.PhoneNumber = (updateInput.PhoneNumber ?? string.Empty).Trim();
        entity.Role = HotelUserRoles.Normalize(updateInput.Role);
        entity.AllowNavigation = updateInput.AllowNavigation;
        entity.LandingPagePath = NormalizeLandingPagePath(updateInput.LandingPagePath);
        if (!string.IsNullOrWhiteSpace(updateInput.Password))
        {
            entity.Password = updateInput.Password;
        }
    }

    private static string NormalizeLandingPagePath(string? value)
    {
        var trimmed = (value ?? string.Empty).Trim();
        if (trimmed.Length == 0 || trimmed == "/")
        {
            return "/dashboard";
        }

        if (Uri.TryCreate(trimmed, UriKind.Absolute, out var absoluteUri) &&
            (absoluteUri.Scheme == Uri.UriSchemeHttp || absoluteUri.Scheme == Uri.UriSchemeHttps))
        {
            trimmed = absoluteUri.PathAndQuery;
        }

        var withSlash = trimmed.StartsWith('/') ? trimmed : $"/{trimmed}";
        var qIndex = withSlash.IndexOf('?');
        var pathPart = qIndex >= 0 ? withSlash[..qIndex] : withSlash;
        var query = qIndex >= 0 ? withSlash[(qIndex + 1)..] : string.Empty;
        var path = pathPart.TrimEnd('/');
        if (path.Length == 0)
        {
            path = "/";
        }

        return query.Length > 0 ? $"{path}?{query}" : path;
    }
}
